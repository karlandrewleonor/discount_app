import React, { Component, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {Helmet} from "react-helmet";
import icon from '../images/icon.png'
import { ToastContainer } from 'react-toastify'
import Loader from './Loader.json'
import Lottie from 'react-lottie-player'

function App(props) {

	const [isLoaded, setLoadState]=useState(false)

	useEffect(()=>{
		setLoadState(true)
	},[])

	var content = null
	if(isLoaded){
		content = props.children
	}else{
		content = <div style = {styles.pre_loader}>
					<div style = {{maxWidth: 300}}>
						<Lottie
							loop
							animationData={Loader}
							play
							style={{ width: "90%" }}
						/>
					</div>
				</div>
	}

	return (
		<div id='main'>
			<Helmet
				meta={[
				{
					name: 'viewport',
					content: 'width=device-width, initial-scale=1',
				},
				]}>
				{/* <link rel="icon" href={icon} /> */}
				<title>Discount App</title>
			</Helmet>
			{content}
			<ToastContainer/>
		</div>
	)
}

export default App;

const styles = {
	pre_loader:{
		background: "#690903",
		backgroundSize: "cover",
		height: "100vh",
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center"
	}
}
