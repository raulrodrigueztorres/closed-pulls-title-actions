const core = require('@actions/core');
const { Octokit } = require('@octokit/rest');

try {
    const octokit = new Octokit();
    const promises = [];
    let titles = "";

    const getPulls = octokit.pulls.list({
        owner: 'raulrodrigueztorres',
        repo: 'release_workflow',
        state: 'closed'
    }).then(closedPulls => {
        return closedPulls.data;
    });

    const getLastRelease = octokit.repos.listReleases({
        owner: 'raulrodrigueztorres',
        repo: 'release_workflow'
    }).then(releases => {
        return releases.data[0].created_at;
    });

    promises.push(getPulls, getLastRelease);

    Promise.all(promises).then(results => {
        results[0].forEach(pull => {
            if(pull.closed_at > results[1]) {
                titles += `${pull.title}\n`
            }
        });
        core.setOutput('titles', titles);
    });
} catch (error) {
    core.setFailed(error.message);
}
