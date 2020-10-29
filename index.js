const core = require('@actions/core');
const { Octokit } = require('@octokit/rest');

try {
    let titles = "";
    const promises = [];
    const octokit = new Octokit();

    const splitRepositoryArray = core.getInput('repository').split('/');

    const getPulls = octokit.pulls.list({
        owner: splitRepositoryArray[0],
        repo: splitRepositoryArray[1],
        state: 'closed'
    }).then(closedPulls => {
        return closedPulls.data;
    });

    const getLastRelease = octokit.repos.listReleases({
        owner: splitRepositoryArray[0],
        repo: splitRepositoryArray[1],
    }).then(releases => {
        if(releases.data !== [])
            return releases.data[0].created_at;
        else return undefined;
    });

    promises.push(getPulls, getLastRelease);

    Promise.all(promises).then(results => {
        results[0].forEach(pull => {
            if(results[1] !== undefined && pull.closed_at > results[1]) {
                titles += `${pull.title}\n`
            } else if(results[1] === undefined) {
                titles += `${pull.title}\n`;
            }
        });
        core.setOutput('titles', titles);
    });
} catch (error) {
    core.setFailed(error.message);
}
