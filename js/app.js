// es5, 6, and 7 polyfills, powered by babel
import polyfill from "babel-polyfill"

//
// fetch method, returns es6 promises
// if you uncomment 'universal-utils' below, you can comment out this line
import fetch from "isomorphic-fetch"

import $ from 'jquery'
import BackboneFire from 'bbfire'
import _ from 'underscore'
import Firebase from 'firebase'


import DOM from 'react-dom'
import React, {Component} from 'react'

var rootURL = "https://blogtime.firebaseio.com/"
var ref = new Firebase(rootURL)

// var UserModel = BackboneFire.Firebase.Model.extend({
// 	parse: function(rawData){
// 		console.log("this is the rawData", rawData)
// 	}
// })



var BlogPostCollection = BackboneFire.Firebase.Collection.extend({
	url: '',
	
	initialize:function(uid){
		this.url = rootURL + `/users/${uid}/posts/`
	}
})


var AuthView = React.createClass({
	
	_handleSignUp: function(evt){
		console.log("handle sign up", this)
		evt.preventDefault();
		var emailInput    = evt.currentTarget.email.value
		var passwordInput = evt.currentTarget.password.value
		var fullNameInput = evt.currentTarget.name.value
		

		var newUser ={
			email: emailInput,
			password: passwordInput
		}

		ref.createUser(newUser,function(err,authData){
			
			var userInfoColl = new BlogPostCollection()
				
				userInfoColl.create({
					name: fullNameInput,
					uid: authData.uid
				})
		})
	},

	_handleSignIn: function(evt){
		evt.preventDefault();
		var emailInput = evt.currentTarget.email.value
		var passwordInput = evt.currentTarget.password.value
		
		// console.log(emailInput,passwordInput)

		var authDataObj ={
			email: emailInput,
			password: passwordInput
		} 

		ref.authWithPassword(authDataObj, function(err,authData){
			if(err){
				alert("sorry creds not valid!!!")
			}else{
				console.log("routing to the main!!!")

				rtr.authenticateUser = authData
				rtr.navigate('', {trigger:true})
				location.hash = 'home'
			}
		})
	},

	render: function(){
		return(
			<div>
			<Header />

			<div className="auth-view-container">
			  <form onSubmit={this._handleSignUp}>
			    <h3>Sign Up</h3>
			    <input type="text" id="name" placeholder="first and last name"/><br/>
			    <input type="text" id="email" placeholder="Email"/><br/>
			    <input type="text" id="password" placeholder="Password"/><br/>
			    <input className="button-primary" type="submit" defaultValue="Sign Up"/><br/>
			  </form>

			  <hr/>

			  <form onSubmit={this._handleSignIn}>
			    <h5>Already A Member?</h5><br/>
			    <h3>Login</h3>
			    <input type="text" id="email" placeholder="Email"/><br/>
			    <input type="text" id="password" placeholder="Password"/><br/>
			    <input className="button-primary" type="submit" defaultValue="Login"/><br/>
			  </form>
			</div>
			</div>
			)
	}
})

var HomeView = React.createClass({
	
	_WritePostFunc: function(){
		rtr.navigate('createblog', {trigger:true})
	},

	_ReadPostFunc: function(){
		rtr.navigate('readblog',{trigger:true})
	},

	render: function(){
		return(
			<div>
				<Header />
				<div className="home-button-container">
					<button onClick={this._WritePostFunc}>Write a Post</button>
					<button onClick={this._ReadPostFunc}>Read Posts</button>
				</div>
			</div>
			)
	}
})

var WriterView = React.createClass({


	_addPostFunc: function(postText){
		this.props.freshPost.add({  // why can't I use this.state.freshPost to add to collection
			post:postText 
		})
	},


	render: function(){
		// console.log("this is a new post", this.props.freshPost)
		return(
			<div>
				<Header />
				<AdderPost addPost={this._addPostFunc} freshPost={this.props.freshPost}/> 
			</div>
			)
	}
})

var Header = React.createClass({

	render: function(){
		console.log(this)
		return(
			<div className="header-container">
				<h2>Blog Time</h2>
				<h5>A platform for sharing ideas</h5>
			</div>
			)
	}
})

var AdderPost= React.createClass({
	_handleSubmission: function(e){
		e.preventDefault()
			// console.log("handle submission",this.props.freshPost)

		var newPost = {
			title: e.target.blogTitle.value,
			content:e.target.blogContent.value
		}
		
		// console.log(newPost)

		this.props.freshPost.create(newPost)
		rtr.navigate('readblog',{trigger:true})
	},

	render: function(){
		// console.log("from adderPost:", this)
		return(
			<div className="post-template">
				<form onSubmit={this._handleSubmission}>
					<input type="text" id="blogTitle" placeholder="Blog Title"></input>
					<br/>
					<br/>
					<textarea id="blogContent" placeholder="What's on your mind?"></textarea><br/>
					<input className="submit-post-btn" type="submit" value="Submit Post"/>
				</form>
			</div>
		)
	}

})

var ReaderView = React.createClass({

	getInitialState: function(){
		return{
			newPostColl:this.props.finishedPostColl 
			//  => this.state.newPostColl = this.props.freshPost
		}
	},

	componentDidMount:function(){
		var self = this
		this.props.finishedPostColl.on('sync',function(){
			self.setState({
				newPostColl:self.props.finishedPostColl

			})
		})
	},

	_remover: function(){


	},

	render: function(){
			// console.log("Reader View:", this.props.finishedPostColl)

		return(
			<div>
				<Header />
				<NewIdeaPost finishedPostColl = {this.state.newPostColl}/> 
			</div>
			)
	}
})

var NewIdeaPost = React.createClass({
	
	_makePost: function(model,i){
		// console.log('making post', i)
		return <SinglePost key={i} post={model}/>
	},

	render: function(){
		console.log("this is in NewIdeaPost", this.props.finishedPostColl)
		return(
			<div>
				{this.props.finishedPostColl.map(this._makePost)}
			</div>
			)
	}
})

var SinglePost = React.createClass({
	render: function(){
		// console.log(
			// "single post:", this)

		return(
			<div className="post-container">
				<h3>{this.props.post.get('title')}</h3>
				<p>{this.props.post.get('content')}</p>
			</div>
			)
	}
})

var Logout = React.createClass({
	_handleLogout:function(){
		fbRef.unauth();
		myApp.navigate('authenticate', {trigger:true})
	},

	render: function(){
		return(
			<button className="logout-btn">{this._handleLogout}</button>
			)
	}
})

var BlogRouter = BackboneFire.Router.extend({
	routes:{
		"authenticate"   : "handleAuth",
		"createblog"     : "handleWriterView",
		"readblog"		 : "handleReaderView",
		"*Default"       : "handleHome"
	},

	handleHome:function(){

		var userInfoColl = new BlogPostCollection(ref.getAuth().uid)

		DOM.render(<HomeView userInfo={this.userInfoColl}/>, document.querySelector('.container') )
	},

	handleWriterView: function(){

		var newPostColl = new BlogPostCollection(ref.getAuth().uid)

		DOM.render(<WriterView freshPost={newPostColl}/>, document.querySelector('.container') )
	},

	handleReaderView: function(){
		var pc = new BlogPostCollection(ref.getAuth().uid)

		DOM.render(<ReaderView finishedPostColl={pc}/>, document.querySelector('.container') )
	},

	handleAuth: function(){

		DOM.render(<AuthView/>, document.querySelector('.container') )
	},

	initialize: function(){

		var self = this
		var auth = ref.getAuth()

		if (!auth) location.hash = "authenticate"

		self.on("all", function(){
			if(!ref.getAuth()) location.hash="authenticate"
		}, self)

		// ref.onAuth(function(authData){
		// 	if (authData === null){
		// 		self.authenticateUser = null
		// 	} else {
		// 		self.authenticateUser = authData
		// 	}
		// })

		BackboneFire.history.start()
	}
})

var rtr = new BlogRouter()