import React from "react";

class Footer extends React.Component {
    constructor (props) {
        super (props);
    }

    render() {
        return (
            <div className="footer clearfix mb-0 text-muted">
                <div className="float-start">
                    <p>2023 &copy; Akhari Tech</p>
                </div>
                {/* <div className="float-end">
                    <p>
                    Crafted with{" "}
                    <span className="text-danger">
                        <i className="bi bi-heart-fill icon-mid"></i> </span
                    >{" "} by <a href="https://github.com/marcelino0707">Marcelino</a>
                    </p>
                </div> */}
            </div>
        )
    }
}

export default Footer;