module.exports = robot => {
  const handler = new AutoForkSyncRobotHandler(robot);
  robot.log.info("Auto-fork-sync Started...");
  robot.log.debug(robot);
  robot.on("create", async context => handler.handleCreate(context));
  robot.on("push", async context => handler.handlePush(context));
};

class AutoForkSyncRobotHandler {
  constructor(robot) {
    this.robot = robot;
  }

  async handleCreate(context) {
    this.robot.log.debug(context);
    try {
      const config = await context.config("auto-fork-sync.yml", {
        branch_blacklist: [],
        merge_strategy: "rebase"
      });
      const github = context.github;
      const payload = context.payload;
      const forks = await this.getListOfForks(payload.repository, github);
      const branchName = payload.ref.substring(11); // Gets rid of the refs/head/ part
      if (config.branch_blacklist.includes(branchName)) {
        return;
      }
      const parentRepo = getRepoDict(payload.repository);
      for (const fork of forks) {
        try {
          await this.createChildBranch(branchName, parentRepo, fork);
        } catch(e) {
          this.robot.log.error(e);
        }
      }
    } catch (err) {
      this.robot.log.error(err);
    }
  }

  async handlePush(context) {
    this.robot.log.debug(context);
    try {
      const config = await context.config("auto-fork-sync.yml", {
        branch_blacklist: [],
        merge_strategy: "rebase"
      });
      const github = context.github;
      const payload = context.payload;
      const forks = await this.getListOfForks(payload.repository, github);
      this.robot.log.debug(forks);
      const branchName = payload.ref.substring(11); // Gets rid of the refs/head/ part
      const parentHash = payload.head_commit.id;
      if (config.branch_blacklist.includes(branchName)) {
        return;
      }
      const parentRepo = getRepoDict(payload.repository);
      for (const fork of forks) {
        try {
          await this.updateChildBranch(branchName, parentHash, parentRepo, fork);
        } catch(e) {
          this.robot.log.error(e);
        }
      }
    } catch (err) {
      this.robot.log.error(err);
    }
  }

  async createChildBranch(branchName, parentRepo, childRepo) {
    try {
      const github = await this.getClientForRepo(childRepo);
      // TODO: Create PR from parent to existing branch on child
      // Create ref with the head sha from that PR
    } catch (err) {
      this.robot.log.error(err);
    }
  }

  async updateChildBranch(branchName, parentSha, parentRepo, childRepo) {
    // Instead of creating pull requests and merging them, could we create pull requests and then
    // set the branch to the ref in the PR? Does the sha even exist in the repo at that point?
    // Answer: yes it does. Sweet
    try {
      const github = await this.getClientForRepo(childRepo);
      const pullRequestId = await this.createPullRequest(
        github,
        parentRepo,
        childRepo,
        branchName
      );
      await this.setBranchToRef(github, childRepo, parentSha, branchName);
      // await this.mergePullRequest(pullRequestId, childRepo, github)
    } catch (err) {
      this.robot.log.error(err);
    }
  }

  async mergePullRequest(pullRequestId, childRepo, github) {
    this.robot.log.info(
      `Attempting to merge pull request ${pullRequestId} on ${getRepoString(
        childRepo
      )}`
    );
    try {
      const mergeResult = await github.pullRequests.merge({
        owner: childRepo.owner,
        repo: childRepo.repo,
        number: pullRequestId,
        merge_method: 'merge'
      });
      if (mergeResult.data.merged) {
        this.robot.log.info("Successfully merged...");
        this.robot.log.info(mergeResult);
      } else {
        this.robot.log.error(mergeResult);
      }
    } catch (err) {
      this.robot.log.error(err);
    }
  }

  async setBranchToRef(github, repo, sha, branchName) {
    this.robot.log.info(
      `Attempting to set branch ${branchName} on ${getRepoString(
        repo
      )} to sha ${sha}`
    );
    try {
      const force = false; //This will overwrite all changes in the target
      const payload = {
        owner: repo.owner,
        repo: repo.repo,
        ref: `heads/${branchName}`,
        sha: sha,
        force: force
      };
      const result = await github.gitdata.updateReference(payload);
      this.robot.log.debug(result);
    } catch (err) {
      this.robot.log.error(err);
    }
  }

  async createPullRequest(github, parentRepo, childRepo, branchName) {
    const payload = {
      title: `[Auto Fork Sync] Updating branch ${branchName}`,
      owner: childRepo.owner,
      repo: childRepo.repo,
      head: `${parentRepo.owner}:${branchName}`,
      base: branchName,
      body: "Auto Fork Sync engaged",
      maintainer_can_modify: false // See: https://github.com/octokit/rest.js/pull/491
    };
    try {
      this.robot.log.info(
        `Trying to create a pullRequest on child ${getRepoString(childRepo)}`
      );
      const result = await github.pullRequests.create(payload);
      return result.data.number;
    } catch (err) {
      const errors = JSON.parse(err.message).errors;
      if (
        errors[0].message == `A pull request already exists for ${parentRepo.owner}:${branchName}.`
      ) {
        this.robot.log.warn(errors[0].message)
      } else {
        this.robot.log.error("Caught error");
        //this.robot.log.error(err);
        this.robot.log.error(errors);
      }
      for (const error of errors) {
        if (
          error.resource === "PullRequest" &&
          error.field === "base" &&
          error.code === "invalid"
        ) {
          this.robot.log.error(
            `The branch does not exist on ${getRepoString(childRepo)}`
          );
          // TODO: Try creating it!
        }
      }
      //return undefined;
    }
  }

  async getClientForRepo({ owner }) {
    try {
      const appClient = await this.robot.auth();
      // TODO: Paginate
      // TODO: Cache
      const installations = await appClient.apps.getInstallations({});
      this.robot.log.debug("INSTALLATIONS");
      this.robot.log.debug(installations);
      for (const installation of installations.data) {
        if (installation.account.login === owner) {
          return this.robot.auth(installation.id);
        }
      }
    } catch (err) {
      this.robot.log.error(err);
      return undefined; // Should figure out how error handling works.
    }
  }

  async getListOfForks(repository, github) {
    try {
      const { owner, repo } = getRepoDict(repository);
      const result = await github.repos.getForks({
        owner,
        repo
      });
      return result.data.map(getRepoDict);
    } catch (err) {
      this.robot.log.error(err);
    }
  }
}

function getRepoDict(repository) {
  return {
    owner: repository.owner.login,
    repo: repository.name
  };
}

function getRepoString(repo) {
  return `${repo.owner}/${repo.repo}`;
}
