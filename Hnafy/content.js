// Save problem code
if (window.location.pathname.startsWith("/problemset/problem/")) {
    const parts = window.location.pathname.split("/");
    const problemCode = `${parts[3]}${parts[4]}`;

    chrome.storage.local.set({
        cf_problem_code: problemCode,
    });
}

// Auto fill submit page
if (window.location.pathname === "/problemset/submit") {
    const input = document.querySelector('input[name="submittedProblemCode"]');

    if (input) {
        chrome.storage.local.get(["cf_problem_code"], ({ cf_problem_code }) => {
            if (cf_problem_code) {
                input.value = cf_problem_code;
            }
        });
    }
}
