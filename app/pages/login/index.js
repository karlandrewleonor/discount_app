import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { pageLoad, formChange, loginFailed, loginNow, showForgot, closeForgot,
    submitNow, submitFailed, forgotClearErr
} from './action'
import _ from 'lodash'
import ButtonWithLoader from '../../components/ButtonWithLoader'
import logo from '../../images/logo.png'
import { browserHistory } from 'react-router'

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

export function Index(props){

    const history = browserHistory

    const { isLogging, hasError, errorMessage, data } = props

    useEffect(()=>{
        const token = localStorage.getItem('token');
        if (!_.isEmpty(token)) {
            history.push("/dashboard")
        }else{
            props.onInit()
        }
    }, [])

    const handleLogin = (e) =>{
        try {
            e.preventDefault();
        } catch (err) { }

        var checkEmail = validateEmail(data.emailadd)

        if (_.isEmpty(data.username.trim())) {
            props.onLoginFailed("Please enter username.")
            return;
        } else if (_.isEmpty(data.password.trim())) {
            props.onLoginFailed("Please enter password.")
            return;
        }
        props.onLoginNow(data)
    }

    const onChange = (e) => {
        props.onFormChange(e.target.name, e.target.value)
    }

    const handleForgotPwd = () => {
        props.onShowForgot()
    }

    useEffect(()=>{
        if (props.isLoginSuccess){
            history.push("/adminusers")
        }
    })

    var errorBox = <div className="box-error d-flex">
                        <i className={"fas fa-exclamation-triangle " + (hasError ? "" : "d-none")} />
                        <p>{errorMessage}</p>
                    </div>

return (
    <div className="login">
        <div className="login-form rounded-sm p-5">
            <div className="login-logo text-center">
                <center><img src={logo} /></center>
            </div>
            <br />
            <center><h5>ADMINISTRATOR</h5></center>
            {errorBox}
            <div className="login-fields">
                <form onSubmit={handleLogin} autoComplete="off">
                    <div className="form-group">
                        <input id="username"
                            name='username'
                            type='text'
                            value={data.username}
                            placeholder="Username"
                            onChange={onChange}
                            className="form-control"
                            maxLength={20} />
                    </div>
                    <div className="form-group">
                        <input id="password"
                            name='password'
                            placeholder="Password"
                            value={data.password}
                            onChange={onChange}
                            type="password"
                            className="form-control"
                            maxLength={20} />
                    </div>
                    <div className="form-group submit">
                        <ButtonWithLoader isLoading={isLogging}
                            classNames="btn primary-btn btn-block"
                            type="submit"
                            onClick={handleLogin}>
                            Sign In
                        </ButtonWithLoader>
                    </div>
                </form>
            </div>
            <div className="copyright">
                <label>© 2022 DISCOUNT ADMIN. All Rights Reserved. Terms and Privacy</label>
            </div>
        </div>
    </div>
);

}

const mapStateToProps = (state) => {
    return {
        isLogging: state.login.isLogging,
        isLoginSuccess: state.login.isLoginSuccess,
        hasError: state.login.hasError,
        errorMessage: state.login.errorMessage,
        data: state.login.data,
        showForgot: state.login.showForgot,
        isSubmitting: state.login.isSubmitting,
        isSubmitSuccess: state.login.isSubmitSuccess,
        isSubmitHasError: state.login.isSubmitHasError
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onInit: () => {
            dispatch(pageLoad())
        },
        onLoginNow: (data) => {
            dispatch(loginNow(data))
        },
        onFormChange: (field, value) => {
            dispatch(formChange(field, value))
        },
        onLoginFailed: (message) => {
            dispatch(loginFailed(message))
        },
        onShowForgot: () => {
            dispatch(showForgot())
        },
        onCloseForgot: () => {
            dispatch(closeForgot())
        },
        onSubmitNow: (data) => {
            dispatch(submitNow(data))
        },
        onSubmitFailed: (message) => {
            dispatch(submitFailed(message))
        },
        onForgotClearErr: () => {
            dispatch(forgotClearErr())
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Index);



