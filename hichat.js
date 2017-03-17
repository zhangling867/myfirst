window.onload=function(){
	var hichat=new HiChat();
	hichat.init();	
}
 
 var HiChat=function(){
 	this.socket=null;
 }
 HiChat.prototype={
 	init:function(){
 		var that=this;
 		this.socket=io.connect();
 		this._initialEmoji();
 		document.getElementById("emoji").addEventListener("click",function(e){
 			var emojiWrapper=document.getElementById("emojiWrapper");
 			emojiWrapper.style.display="block";
 			e.stopPropagation();
 		},false);

 		document.body.addEventListener("click",function(e){
 			var emojiWrapper=document.getElementById("emojiWrapper");
 			if(e.target!=emojiWrapper){
 				emojiWrapper.style.display="none";
 			}
 		})
 		document.getElementById("emojiWrapper").addEventListener("click",function(e){
 			var target=e.target;
 			if(target.nodeName.toLowerCase()=='img'){
 				var messageInput=document.getElementById("messageInput");
 				messageInput.focus();
 				messageInput.value=messageInput.value+'[emoji:'+target.title+']';
 			}
 		},false);
 		document.getElementById("nicknameInput").addEventListener("keyup",function(e){
 				if(e.keyCode==13){
 					var nickName=document.getElementById("nicknameInput").value;
 					if(nickName.trim().length!=0){
 						that.socket.emit("login",nickName)
 					}
 				}
 		},false)
 		document.getElementById("messageInput").addEventListener("keyup",function(e){
 			if(e.keyCode==13){
 				var color =document.getElementById("colorStyle").value,
 				messageInput=document.getElementById("messageInput"),
 				msg=messageInput.value;
 				if(msg.trim().length!=0){
 					that.socket.emit("postMsg",msg,color);
 					that._displayNewMsg("me",msg,color);
 					messageInput.value="";
 				}
 			}
 		},false)
 		this.socket.on('connect',function(){
 			document.getElementById('info').textConcent="get yourself anickname :)";
 			document.getElementById('nickWrapper').style.display="block";
 			document.getElementById("nicknameInput").focus();
 			document.getElementById('loginBtn').addEventListener("click",function(){
 			var nickName=document.getElementById("nicknameInput").value;
 			if(nickName.trim().length!=0){
 			that.socket.emit('login',nickName);
 			}else{
 			document.getElementById("nicknameInput").focus();
 			}
 		},false)
 			document.getElementById("sendBtn").addEventListener("click",function(){
 				var messageInput=document.getElementById("messageInput"),
 				color=document.getElementById("colorStyle").value;
 				msg=messageInput.value;
 				messageInput.value='';
 				messageInput.focus();
 				if(msg.trim().length!=0){
 					that.socket.emit("postMsg",msg,color);
 					that._displayNewMsg('me',msg,color);	
 				}
 			},false)
 		})
 		this.socket.on("nickExisted",function(){
 			document.getElementById("info").textContent="!nickname is taken, choose another pls"
 		})
 		this.socket.on("loginSuccess",function(){
 			document.title="hichat|"+document.getElementById("nicknameInput").value;
 			document.getElementById('loginWrapper').style.display = 'none';//隐藏遮罩层显聊天界面
 			document.getElementById("messageInput").focus();
 		})
 		this.socket.on('system',function(nickName,userCount,type){
 			var msg=nickName+(type=="login"?"joined":"left");
 			that._displayNewMsg('system',msg,'red');
 		
 			document.getElementById("status").textContent=userCount+(userCount>1?"users":"user")+"online";	
 		})
 		this.socket.on('newMsg',function(user,msg,color){
 			that._displayNewMsg(user,msg,color);
 		})
 		this.socket.on("newImg",function(user,img){
 			that._displayImg(user,img)
 		})
 		document.getElementById('sendImage').addEventListener("change",function(){
 			if(this.files.length!=0){
 				var files=this.files[0],
 				reader=new FileReader();
 				if(!reader){
 					that._displayNewMsg('system','|your browser does\'t suport fileReader','red');
 					this.value="";
 					return;	
 				}
 				reader.onload=function(e){
 					this.value="";
 					that.socket.emit('img',e.target.result);
 					that._displayImg('me', e.target.result);
 				}
 				reader.readAsDataURL(files);
 			}
 		},false)
 	},
 	_displayNewMsg:function(user,msg,color){
 		var container=document.getElementById('historyMsg'),
 		msgToDisplay=document.createElement("p"),
 		date=new Date().toTimeString().substr(0,8);
 		msg=this._showEmoji(msg);
 		msgToDisplay.style.color=color||'#000';
 		msgToDisplay.innerHTML=user+'<span class="timespan">('+date+'):</span>'+msg;
 		container.appendChild(msgToDisplay);
 		container.scrollTop=container.scrollHeight;
 	},
 	_displayImg:function(user,img,color){
 		var container=document.getElementById("historyMsg");
 		msgToDisplay=document.createElement("p"),
 		date=new Date().toTimeString().substr(0,8);
 		msgToDisplay.style.color=color||'#000';
 		  msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span>' + '<a href="' + img + '" target="_blank"><img src="' + img + '"/></a>';
 		container.appendChild(msgToDisplay);
 		container.scrollTop=container.scrollHeight;
 	},
 	_initialEmoji:function(){
 		var emojiContainer=document.getElementById("emojiWrapper"),
 		dooFragment=document.createDocumentFragment();
 		for(var i=69;i>0;i--){
 			var emojiItem=document.createElement("img");
 			emojiItem.src='../content/emoji/'+i+'.gif';
 			emojiItem.title=i;
 			dooFragment.appendChild(emojiItem);
 		}
 		emojiContainer.appendChild(dooFragment);
 	},
 	_showEmoji:function(msg){
 		var match,result=msg,
 		reg=/\[emoji:\d+\]/g,
 		emojiIndex,
 		totalEmojiNum=document.getElementById("emojiWrapper").children.length;
 		while(match=reg.exec(msg)){
 			emojiIndex=match[0].slice(7,-1);
 			if(emojiIndex>totalEmojiNum){
 				result=result.replace(match[0], '[X]');
 			}else{
 				result=result.replace(match[0], '<img class="emoji" src="../content/emoji/' + emojiIndex + '.gif" />');
 			}
 		}
 		return result;
 	}
 }
 
 