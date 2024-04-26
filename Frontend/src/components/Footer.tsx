
const Footer = () => {
    return (
        <footer className="bg-blue-100/80 font-sans dark:bg-gray-900">
            <div className="container px-6 py-6 mx-auto">
        
                
                <div className="sm:flex sm:items-center sm:justify-center">
                 
                    
                    <div className="flex gap-4 hover:cursor-pointer">
                        <a href="https://twitter.com/jjinendra3" target="_blank">
                        <img src="https://www.svgrepo.com/show/303115/twitter-3-logo.svg" width="30" height="30" alt="tw"  /></a>
                        <a href="https://github.com/jjinendra3" target="_blank">
                        <img src="https://www.svgrepo.com/show/94698/github.svg" className="" width="30" height="30" alt="gt" /></a>
                        <a href="https://jinendrajain.xyz" target="_blank">
                        <img src="https://www.svgrepo.com/show/530495/link.svg" className="" width="30" height="30" alt="db" />
                        </a>
                        <a href="https://linkedin.com/in/jjinendra3" target="_blank">

                        <img src="https://www.svgrepo.com/show/28145/linkedin.svg" width="30" height="30" alt="in" />
                        </a>
                        <a href="https://mail.google.com/mail/?view=cm&fs=1&to=jjinendra3@gmail.com" target="_blank">
                        <img src="https://www.svgrepo.com/show/530453/mail-reception.svg" width="30" height="30" alt="in" /></a>
                    </div>
                </div>
                <p className="font-sans p-8 text-start md:text-center md:text-lg md:p-4 text-white"> Made By Jinendra Jain. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
