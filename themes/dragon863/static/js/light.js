window.addEventListener("pointermove", (event) => {
    document.getElementById("main-box").style.background = `radial-gradient(circle at ${event.pageX}px ${event.pageY}px, rgba(0, 0, 0, 0) 10px, rgba(0, 0, 0, 0.8) 80px)`;
});

function navigateToGithub() {
    window.open("https://github.com/Dragon863", "_blank");
}

function navigateToLinkedIn() {
    document.location = "https://www.linkedin.com/in/daniel-benge/";
}

function mailTo() {
    window.location.href = "mailto:hi@danieldb.uk";
}
