const content_dir = 'contents/'
const config_file = 'config.yml'
const section_names = ['home', 'publications', 'awards', 'others']

window.addEventListener('DOMContentLoaded', event => {

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

    // Load config.yml
    fetch(content_dir + config_file)
        .then(response => response.text())
        .then(text => {
            const yml = jsyaml.load(text);
            Object.keys(yml).forEach(key => {
                try {
                    if (key === "social_links") {
                        const container = document.getElementById("social_links");
                        if (container) {
                            let html = "";
                            yml.social_links.forEach(link => {
                                html += `<a href="${link.url}" target="_blank" class="me-3">
                                    <i class="${link.icon}"></i> ${link.label}
                                </a>`;
                            });
                            container.innerHTML = html;
                        }
                    } else {
                        document.getElementById(key).innerHTML = yml[key];
                    }
                } catch {
                    console.log("Unknown id and value: " + key + "," + yml[key].toString())
                }
            })
        })
        .catch(error => console.log("⚠️ Failed to load config.yml", error));

    // Load markdown sections
    marked.use({ mangle: false, headerIds: false })
    section_names.forEach((name) => {
        const path = content_dir + name + '.md';
        fetch(path)
            .then(response => {
                console.log("Fetching:", path, response.status);
                if (!response.ok) {
                    throw new Error("Failed to load " + path + " (" + response.status + ")");
                }
                return response.text();
            })
            .then(markdown => {
                const html = marked.parse(markdown);
                document.getElementById(name + '-md').innerHTML = html;
                MathJax.typeset();
            })
            .catch(error => {
                console.error("Error loading section:", name, error);
                const target = document.getElementById(name + '-md');
                if (target) {
                    target.innerHTML = `<p style="color:red;">⚠️ Failed to load ${path}</p>`;
                }
            });
    });

});
