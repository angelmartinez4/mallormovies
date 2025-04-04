class Footer extends HTMLElement {
    constructor() {
      super();
    }
  
        connectedCallback() {
            this.innerHTML = `
            <!-- Footer Start -->
            <div class="container-fluid bg-dark text-body footer mt-5 pt-5 wow fadeIn" data-wow-delay="0.1s">
                <div class="container py-5">
                    <div class="row g-5">
                        <div class="col-lg-3 col-md-6">
                            <h5 class="text-white mb-4">Links</h5>
                            <a class="btn btn-link" href="https://www.uib.cat/">UIB</a>
                            <a class="btn btn-link" href="https://github.com/angelmartinez4/mallormovies">Github</a>
                            <a class="btn btn-link" href="https://www.dondominio.com/es/">DonDominio</a>
                            <a class="btn btn-link" href="https://htmlcodex.com/renewable-energy-website-template">Plantilla</a>
                        </div>
                    </div>
                </div>
                <div class="container">
                    <div class="copyright">
                        <div class="row">
                            <div class="col-md-6 text-center text-md-start mb-3 mb-md-0">
                                &copy; <a href="#">Your Site Name</a>, All Right Reserved.
                            </div>
                            <div class="col-md-6 text-center text-md-end">
                                <!--/*** This template is free as long as you keep the footer author’s credit link/attribution link/backlink. If you'd like to use the template without the footer author’s credit link/attribution link/backlink, you can purchase the Credit Removal License from "https://htmlcodex.com/credit-removal". Thank you for your support. ***/-->
                                Designed By <a href="https://htmlcodex.com">HTML Codex</a>
                                <br>Distributed By: <a href="https://themewagon.com" target="_blank">ThemeWagon</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Footer End -->
            `;
        }
    }
  
  // Define the new element
  customElements.define('foo-ter', Footer);
  