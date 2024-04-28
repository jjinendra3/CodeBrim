import { FaGlobe } from "react-icons/fa";
const Footer = () => {
  return (
    <footer className="font-sans">
      <div className="flex items-center justify-center text-center">
        <div className="flex gap-4 hover:cursor-pointer">
          <a href="https://twitter.com/jjinendra3" target="_blank">
            <img
              src="https://www.svgrepo.com/show/303115/twitter-3-logo.svg"
              width="30"
              height="30"
              alt="tw"
            />
          </a>
          <a href="https://github.com/jjinendra3" target="_blank">
            <img
              src="https://www.svgrepo.com/show/94698/github.svg"
              className=""
              width="30"
              height="30"
              alt="gt"
            />
          </a>
          <a href="https://jinendrajain.xyz" target="_blank">
            <FaGlobe className="h-[30px] w-[30px] text-white" />
          </a>
          <a href="https://linkedin.com/in/jjinendra3" target="_blank">
            <img
              src="https://www.svgrepo.com/show/28145/linkedin.svg"
              width="30"
              height="30"
              alt="in"
            />
          </a>
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=jjinendra3@gmail.com"
            target="_blank"
          >
            <img
              src="https://www.svgrepo.com/show/530453/mail-reception.svg"
              width="30"
              height="30"
              alt="in"
            />
          </a>
        </div>
      </div>
      <p className="font-sans p-8  text-center md:text-lg md:p-4 text-white font-semibold">
        {" "}
        © 2024 Jinendra Jain. All Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;
