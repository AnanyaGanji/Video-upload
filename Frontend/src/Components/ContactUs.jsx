export default function ContactUs() {
  return (
    <div className="p-1 mt-5 text-center m-3">
      <div className="container d-flex pt-4 flex-column shadow-lg bg-white rounded-4">
        <div className="p-3">
          <div className="fw-semibold display-3 border-black border-bottom border-2">
            Contact Us
          </div>
          <div className="mt-3 fw-medium text-center px-md-5 px-2">
            We are here to help you with any queries you have. <br />
            We look forward to hearing from you!
          </div>
          <div className="m-3 d-flex flex-column flex-md-row justify-content-center align-items-center gap-3 mt-4">
            {/*<div className="d-flex align-items-center">
                 <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  className="bi bi-telephone me-2"
                  viewBox="0 0 16 16"
                >
                </svg>
                <span>+91 1234567890</span>
              </div> */}
            <div className="d-flex align-items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                className="bi bi-envelope me-2"
                viewBox="0 0 16 16"
              >
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z" />
              </svg>
              <a href="mailto:info@joywithlearning.com">
                info@joywithlearning.com
              </a>
            </div>
            <div className="d-flex align-items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                className="bi bi-geo-alt-fill me-2"
                viewBox="0 0 16 16"
              >
                <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6" />
              </svg>
              <span>Barkathpura, Champapet, Himyatnagar and Nacharam</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
