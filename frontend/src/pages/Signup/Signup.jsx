import React, { useRef, useState, useEffect } from "react";
import { StyledSignup } from "./Signup.styles";
import { useNavigate, Link } from "react-router-dom";
export default function Signup() {
    const usernameRef = useRef("");
    const passwordRef = useRef("");
    const confirmPasswordRef = useRef("");
    const emailRef = useRef("");

    //get inputs values from userefs
    let username = usernameRef.current.value,
        password = passwordRef.current.value,
        confirmPassword = confirmPasswordRef.current.value,
        email = emailRef.current.value;

    //error description box states
    const [errorFlag, setErrorFlag] = useState(false);
    const [errorDesc, setErrorDesc] = useState([]);

    // individual error flags for inputs
    const [usernameError, setUsernameError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);

    const navigate = useNavigate();

    ///EMAIL TEST
    function emailFormatValid(emailStr) {
        const emailRegex = new RegExp(
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
        );
        //test email string with regex
        return emailRegex.test(emailStr);
    }

    ///CHECK FORM FOR ERRORS
    function checkFormForErrors() {
        let errors = [];

        //check email exists and is valid format
        // if (!emailFormatValid(email) && email) {
        if (!emailFormatValid(email) && email) {
            setEmailError(true);
            errors.push("email format invalid");
        }

        //passwords match check
        if (password !== confirmPassword) {
            setPasswordError(true);
            errors.push("passwords do not match");
        }

        if (errors.length > 0) {
            setErrorFlag(true);
            return errors;
        }

        return [];
    }

    ///SUBMIT FORM
    async function handleSignUp() {
        setErrorFlag(false);
        const formErrors = checkFormForErrors();

        ///form had errors set message to display to user
        if (formErrors.length > 0) {
            setErrorDesc(formErrors);
            return;
        }

        ///sign up user
        try {
            const response = await fetch("http://localhost:4000/api/signup", {
                method: "post",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    username,
                    password,
                }),
            });

            if (response.status == 401) {
                throw Error(`Username and/or Email already exists`);
            }
            ///error was not status 201 get status text and throw error
            if (response.status != 201) {
                throw Error(`server response error ${response.statusText}`);
            }
        } catch (error) {
            //display error to user
            setErrorFlag(true);
            setErrorDesc([error.message]);
            return;
        }

        ///login in user
        try {
            const response = await fetch("http://localhost:4000/api/login", {
                method: "post",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });

            if (response.status === 200) {
                const data = await response.json();
                localStorage.setItem("JWT", data.token);
            } else {
                throw Error(response.statusText);
            }
        } catch (error) {
            ///display error to user
            setErrorFlag(true);
            setErrorDesc([error.message]);
            return;
        }

        ///redirect user upon successfull login
        navigate("/search");
    }

    return (
        <StyledSignup>
            <section className="form-sect">
                <form
                    action="#"
                    onSubmit={(event) => {
                        event.preventDefault();
                        handleSignUp();
                    }}>
                    <div className="title">
                        <h2>
                            Welcome to Pantry Pal <br></br>Signup Here
                        </h2>
                    </div>

                    <div className="input-container">
                        {emailError && <span className="error-marker">*</span>}
                        <label className="input-tag" htmlFor="email">
                            Email
                        </label>
                        <input
                            className={emailError ? "error-container" : ""}
                            ref={emailRef}
                            onChange={(event) => {
                                email = event.target.value;
                                setEmailError(false);
                            }}
                            id="email"
                            type="text"
                            required
                        />
                        {emailError && <span className="error-marker">*</span>}
                    </div>

                    <div className="input-container">
                        {usernameError && (
                            <span className="error-marker">*</span>
                        )}
                        <label className="input-tag" htmlFor="username">
                            Username
                        </label>
                        <input
                            className={usernameError ? "error-container" : ""}
                            ref={usernameRef}
                            onChange={(event) => {
                                username = event.target.value;
                            }}
                            id="username"
                            type="text"
                            required
                        />
                        {usernameError && (
                            <span className="error-marker">*</span>
                        )}
                    </div>

                    <div className="input-container">
                        {passwordError && (
                            <span className="error-marker">*</span>
                        )}
                        <label className="input-tag" htmlFor="password">
                            Password
                        </label>
                        <input
                            className={passwordError ? "error-container" : ""}
                            ref={passwordRef}
                            onChange={(event) => {
                                password = event.target.value;
                                setPasswordError(false);
                            }}
                            id="password"
                            type="password"
                            required
                        />
                        {passwordError && (
                            <span className="error-marker">*</span>
                        )}
                    </div>

                    <div className="input-container">
                        {passwordError && (
                            <span className="error-marker">*</span>
                        )}
                        <label htmlFor="confirmpassword" className="input-tag">
                            Confirm Password
                        </label>
                        <input
                            className={passwordError ? "error-container" : ""}
                            ref={confirmPasswordRef}
                            onChange={(event) => {
                                confirmPassword = event.target.value;
                                setPasswordError(false);
                            }}
                            id="confirmpassword"
                            type="password"
                            required
                        />

                        {passwordError && (
                            <span className="error-marker">*</span>
                        )}
                    </div>

                    <div className="submit-btn">
                        <button className="btn">Signup</button>
                    </div>
                </form>
                {errorFlag && (
                    <section className="error-container error-desc">
                        <div>
                            <h4>Please correct following errors</h4>
                            <ul>
                                {errorDesc.map((str, index) => {
                                    return <li key={index}>{str}</li>;
                                })}
                            </ul>
                        </div>
                    </section>
                )}
            </section>

            <div className="btn goto-btn">
                <Link to="/login">
                    Already signed<br></br>up login here
                </Link>
            </div>
        </StyledSignup>
    );
}
