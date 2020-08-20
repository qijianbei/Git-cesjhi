//var postHost = "http://post2.q236.cn";
//var postHost = "http://xiuxiu2020.applinzi.com";
var postHost = "";


$(function(){
    allOnload()
    loadinit();
    ispayold();
})

function ispayold() {
    $.ajax({
        url: postHost + "/post/ispayold.php",
        type: "GET",
        xhrFields:{
            withCredentials:true//允许携带cookie
        },
        async:false,
        dataType: "json",
        success: function (obj) {
            console.log(obj)
            if(obj.code === 1){
            	alert(obj.data)
            }
        }, 
        error: function () {}
    });
};

function loadinit(){
    var usermsg = null;
    var user = localStorage.getItem("user");
    
    ($("#LoadReg").length>0 || $("#LoadLogin").length>0) && isLoginUserByPid();
    $("#loadPay").length>0 && getPayType();
    $("#payokload").length > 0 && loadPayok();
    //$("#LoadIndex").length > 0 && LoadDate();
    ($("#LoadIndex").length > 0 && user) && LoadDate();
    //$("#LoadPass").length>0 && LoginUserByOid();
   
    if(user){
        usermsg = JSON.parse(user)
        console.log($("#LoadPass").length>0,usermsg.data.Mobile.length==11,usermsg.data.Mobile)
        $("#LoadPass").length>0 && usermsg.data.Mobile.length==11 && $("#mobile").addClass('disabled').attr("disabled","disabled").val(usermsg.data.Mobile)//修改密码设置手机号
        $("#LoadUser").length>0 && usermsg && GetUserInfo(usermsg);
    }
    
    
    
    $('#mobile,#code,#pass').on('input propertychange',function (){
        var mobile = $("#mobile").val()
        var code = $("#code").val()
        var pass = $("#pass").val()
        console.log(mobile,code,pass,$("#LoadPass").length,$("#LoadLogin").length);

        mobile.length >5 && pass.length >5?$('#toastBtn').addClass('toastBtn_active').attr("disabled",false):$('#toastBtn').removeClass('toastBtn_active').attr("disabled","disabled")
        mobile.length ? $('.mobile i').show():$('.mobile i').hide()
        $("#LoadPass").length || $("#loadBindmobile").length ? "": (mobile.length == 11 ? $('.code').slideDown():$('.code').slideUp())

    });
    $('.mobile i').click(function(){//删除手机号
        $('#mobile').val("").focus(),$('.mobile i').hide(),$('#toastBtn').removeClass('toastBtn_active').attr("disabled","disabled")
        return false;
    });
    var bool = true;
    $('.pass i').click(function(){//设置密码是否可见
        if(bool){
            bool = false;
            $('#pass').attr('type','text').focus();
            $(this).attr("style","background-image: url(../public/cartoon/images/passyes.png)");
        }else{
            bool = true;
            $('#pass').attr('type','password').focus();
            $(this).attr("style","background-image: url(../public/cartoon/images/passno.png)");
        }
        return false;
    });
    var islogin = 0;
    $('#toastBtn').on('click',function (){
        var mobile = $.trim($("#mobile").val())
        var code = $.trim($("#code").val())
        var pass = $.trim($("#pass").val())
        var pid = $.trim($("#pid").val())
        var ptype = $(this).attr("data-type")

        if (islogin == 1) return false;
        //console.log(i.valName(mobile))

        if (mobile.length < 6) {
            layer.open({
                title:"信息提示",
                content: '请输入正确用户名，6位以上', 
                skin: 'msg', time: 0
            });
            return false;
        }
        if (!valName(mobile)) {
            layer.open({
                title:"信息提示",
                content: '用户名不合法，只允许数字或字母', 
                skin: 'msg', time: 0
            });
            return false;
        }

        if (pass.length < 6) {
            layer.open({
                title:"信息提示",
                content: '密码不得少于6位数！', 
                skin: 'msg', time: 0
            });
            return false;
        }

        if(mobile.length == 11 && code.length != 6 && $("#code").is(":visible")){//注册验证码验证
            layer.open({
                title:"信息提示",
                content: '短信验证码不正确', 
                skin: 'msg', time: 0
            });
            return false;
        }

        var ptypename="操作";
        if(ptype == "reg"){
            ptypename = "注册";
        }else if(ptype == "login"){
            ptypename = "登录";
        }else if(ptype == "newpass"){
            ptypename = "重置密码";
        }else if(ptype == "bindmobile"){
            ptypename = "绑定手机";
        }

        islogin = 1;
        $.ajax({
            url: postHost+"/post/MobileReg",
            data: { "Mobile": mobile,"Code": code,"Pass": pass,"Ptype":ptype,"Pid":pid},
            type: "POST",
            dataType: "json",
            xhrFields:{
                withCredentials:true
            },
            success: function (msg) {
                islogin = 0;
                layer.msg(msg.message);
                if(msg.code === 0){
                    if(msg && msg.token)localStorage.setItem("token",msg.token); 
                    setTimeout(function(){ location.replace("/personal/info?noview=1") }, 500);
                }

            }, error: function () {
                islogin = 0;
                layer.open({
                    title:"信息提示",
                    content: ptypename+'失败', 
                    skin: 'msg', time: 0
                });
            }
        });

    });

    $('#yzm').on('click',function (){
        var m = $("#mobile").val()
        var myreg = /^[1][0-9]{10}$/;
        if (!myreg.test(m) || !m) {
            layer.msg('请输入正确的手机号');
            return false;
        }
        sendCode(m);
    });
    
    $('#midBtn').click(function(){//本机一键登录
        var ptype = $(this).attr("data-type")
        if (islogin == 1) return false;
        
        try {
            var pid = window.AndroidJs.GetAndroidid()
            if(pid.length>10){
                //window.AndroidJs.showToast(pid)

                islogin = 1;
                $.ajax({
                    url: postHost+"/post/MobileReg",
                    data: { "Pid": pid,"Ptype":ptype},
                    type: "POST",
                    dataType: "json",
                    xhrFields:{
                        withCredentials:true
                    },
                    success: function (msg) {
                        islogin = 0;
                        layer.msg(msg.message);
                        if(msg.code === 0){
                            if(msg && msg.token)localStorage.setItem("token",msg.token); 
                            setTimeout(function(){ location.replace("/personal/info?noview=1") }, 500);
                        }

                    }, error: function () {
                        islogin = 0;
                        layer.open({
                            title:"信息提示",
                            content: '本机一键登录失败，请选择其他登录方式', 
                            skin: 'msg', time: 0
                        });
                    }
                });
                
                
            }else{
                layer.open({
                    title:"信息提示",
                    content: '本机一键登录失败，请选择其他登录方式', 
                    skin: 'msg', time: 0
                });
            }
        }catch(err){//在这里处理错误
            layer.msg('本机一键登录失败，请选择其他登录方式');
            console.log("tryerr")
        }
    });
    
    //var back = document.referrer;
    //if(!back)back="/";
    $('#weixinBtn,.resetweixin').click(function(){
        
        $.ajax({ //异步数据加载
            type: "POST",
            data:{"gtype":"gcode"},
            url: postHost+"/post/wxlogin",
            xhrFields:{
                withCredentials:true//允许携带cookie
            },
            success: function (msg) {
               //location.replace("/personal/wxlogin?noview=1"); 
                if(msg.code === 0){
                    console.log(msg.data.wxloginUrl)
                	location.replace(msg.data.wxloginUrl); 
                }else{
                    layer.open({
                        title:"信息提示",
                        content: '微信登录调起失败，请选择其他登录方式', 
                        skin: 'msg', time: 0
                    });
                }
            }, 
            error: function () {
                layer.open({
                    title:"信息提示",
                    content: '微信登录调起失败，请选择其他登录方式', 
                    skin: 'msg', time: 0
                });
            }
        });
        
        
        
    });
    $('.sjLogin').click(function(){
        location.replace("/personal/login?noview=1");
    });
    $('.forget_pass').click(function(){
        location.replace("/personal/pass?noview=1");
    });
    $('.sjReg').click(function(){
        location.replace("/personal/reg?noview=1");
    });
    $('.price-list').on('click',"li", function (){
        $(this).addClass('active').siblings().removeClass('active');
    })
    
    
	var paycheck = false;
    $('.btn-recharge').on('click', function (){
        if (paycheck)return false;

        var money = $('.price-list li.active').attr('data-money')
        var pid = $('.price-list li.active').attr('data-id')
        var ua = navigator.userAgent.toLowerCase();
        var back = document.referrer;

        var paytype = $(this).attr("class").split(" ")[1];
        console.log(back,paytype,money,pid);
        
       
        $.ajax({ //异步数据加载
            type: "POST",
            url: postHost+"/post/payOrder",
            data:{ pid: pid, rurl: back, paytype: paytype, money: money },
            xhrFields:{
                withCredentials:true//允许携带cookie
            },
            beforeSend: function () {
                layer2.open({type: 2, content: '下单中. . .',shadeClose: false});
            },
            success: function (msg) {
                layer2.closeAll();
                if (msg.code === 0 && msg.payurl) {
                    console.log(msg.payurl);
                    //location.replace(msg.payurl)
                    top.location.href=msg.payurl

                }else{
                    layer.msg(msg.msg);
                    paycheck = false;
                }

            },
            error: function () {
                layer2.closeAll();
                layer.msg('支付失败！请联系客服处理');
                paycheck = false;
            }
        });
    })
}

function LoadDate(){
    $.ajax({ //异步数据加载
        type: "POST",
        url: postHost+"/post/LoadDate",
        xhrFields:{
            withCredentials:true//允许携带cookie
        },
        success: function (e) {
            if(localStorage.getItem("date") == e.date)return false;
            var up = e.dataObjUp
            //提示今日更新
            var htmls = ["",""]
            var htmlsul = ["",""]
            $.each(up,function(k, s) {
                if(k<1)htmls[0] = '<div class="viptop"><img data-id="'+s.LinkUrl+'" data-original="'+s.SubImgUrl+'" /><p>'+s.Title+'</p><p class="desc">'+s.Summary+'</p><div class="bgp"></div></div>';
                if(k>=1 && k<7)htmlsul[0] +='<li><img data-id="'+s.LinkUrl+'" data-original="'+s.ImgUrl+'" /><p>'+s.Title+'</p><p class="desc">'+s.Summary+'</p></li>';
                if(k==7)htmls[1] = '<div class="viptop"><img data-id="'+s.LinkUrl+'" data-original="'+s.SubImgUrl+'" /><p>'+s.Title+'</p><p class="desc">'+s.Summary+'<div class="bgp"></div></p></div>';
                if(k>=8 && k<14)htmlsul[1] +='<li><img data-id="'+s.LinkUrl+'" data-original="'+s.ImgUrl+'" /><p>'+s.Title+'</p><p class="desc">'+s.Summary+'</p></li>';
            })
            htmls[0] += '<ul class="top4">'+htmlsul[0]+'</ul>';
            htmls[1] += '<ul class="top4">'+htmlsul[1]+'</ul>';
            htmls = '<div class="cont">'+htmls[0]+'</div><div class="cont hide">'+htmls[1]+'</div>'

            localStorage.setItem("date",e.date); //保存今日已提示更新

            layer.open({
                type: 1,
                title: false,
                btn: ['<img src="/public/cartoon/images/newup.png" />','<img src="/public/cartoon/images/upqie.png" />'],
                skin: 'layui-layer-loadVipWin',
                content: htmls,
                btn1: function (index, layero) {
                    console.log(1)
                    return false;
                } ,
                btn2: function (index, layero) {
                    console.log(2)
                    $(".layui-layer-content .cont").toggle()
                    $(".layui-layer-content img").lazyload(); 
                    return false;
                }
            });

            $(".layui-layer-content img").lazyload(); 

            $('.layui-layer-content').on("click",'img',function (){
            	var LinkUrl = $(this).attr("data-id")
                if(!LinkUrl)return false;
                location.href=LinkUrl
            
            })
             
        },
        error: function () {}
    });

}

function loadPayok() {
    var whilenum = 0;//400次 10分钟
    var interval;
    interval = setInterval(function(){
        whilenum++;
        if(whilenum>400 && interval)clearInterval(interval);//结束
        checkPay(false);
    },1500);
};
function checkPay(isbtn) {
    var order = getURLParameter("order")
    if(!order)location.replace('info.php?noview=1')
    $.ajax({
        url: postHost + "/post/ispay.php",
        data: {"order":order},
        type: "POST",
        xhrFields:{
            withCredentials:true//允许携带cookie
        },
        async:false,
        dataType: "json",
        success: function (obj) {
            console.log(obj.code)
            if(obj.code === 0){
                location.replace('payok?noview=1')
                return false;
            }else if(isbtn){
                console.log("未支付跳转")
                location.replace('payerr?noview=1')
                return false;
            }
        }, 
        error: function () {}
    });
};

function getURLParameter(i) {
    return decodeURIComponent((new RegExp("[?|&|&amp;]" + i + "=([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null
}
function getQuery_url (url,name) {
    url = url+"&"
    var reg = new RegExp("(.*?)"+ name +"=(.*?)&");
    var r = url.match(reg);
    //log(r)
    if (r!=null) return decodeURIComponent(r[2]); return null;
}
//发送验证码
var ischeck = 0;
function sendCode(mobile){
    if (ischeck == 1) {
        return false;
    }
    ischeck = 1;
    $.ajax({
        url: postHost+"/post/getcode",
        data: { mobile: mobile},
        type: "POST",
        dataType: "json",
        xhrFields:{
            withCredentials:true
        },
        success: function (msg) {
            ischeck = 0;
            layer.msg(msg.message);
            if(msg.code === 0){
                var yzm = $("#yzm");
                yzm.attr("disabled","disabled");
                setTimeout(function(){
                    yzm.css("opacity","0.8");
                },1000);
                var time = 60;
                var set = setInterval(function(){
                    yzm.val("("+--time+")秒后重新获取");
                }, 1000);
                setTimeout(function(){
                    yzm.attr("disabled",false).val("重新获取验证码");
                    clearInterval(set);
                }, 60000);
            }

        }, error: function () {
            ischeck = 0;
            layer.msg('发生验证码失败！请稍后重试');
        }
    });
}
//只允许数字和字母
function valName(v){
    var r=/^[a-zA-Z0-9]+$/g;
    return r.test(v);
}
//总加载
function allOnload(){
    $.ajax({ //异步数据加载
        type: "POST",
        url: postHost+"/post/allOnload",
        xhrFields:{
            withCredentials:true//允许携带cookie
        },
        success: function (msg) {
            if(msg.IsCooK == 1)checkCook();
            log(msg)
            if($(".footer .qrcode img").length)$(".footer .qrcode img").attr("src","http://open.weixin.qq.com/qr/code?username="+msg.gzh).attr("alt",msg.gzh);
            if($(".content .number a p").length){
                $(".content .number a p").html(msg.custom);
                $(".content .number a").attr("href","mqqwpa://im/chat?chat_type=wpa&uin="+$(".red").html());
                $(".content .btn a").attr("href","mqqwpa://im/chat?chat_type=wpa&uin="+$(".red").html());
            }
        }
    });
}
//检查是否能跨域保存cookie
function checkCook(){
    $.ajax({ //异步数据加载
        type: "POST",
        url: postHost+"/post/allOnload",
        xhrFields:{
            withCredentials:true//允许携带cookie
        },
        success: function (msg) {
            if(msg.IsCooK == 1)location.replace(postHost+"/post/setCook?noview=1");
        }
    });
}
//下单支付
function payOrder(postdata){
    $.ajax({ //异步数据加载
        type: "POST",
        url: postHost+"/post/payOrder",
        data:postdata,
        xhrFields:{
            withCredentials:true//允许携带cookie
        },
        beforeSend: function () {
            alertBox.innerHTML = "创建订单中...";
            alertBox.style.display = "block";
            $(".layui-m-layershade").show();
        },
        success: function (msg) {
            //return false;
            //alertBox.style.display = "none";
            if(msg.code == 3){location.href="/personal/login";return false;}  
            if(msg.code == 2){
                $(window).openWindow('提示',msg.msg,'["确认"]');
                return false;
            }
            log(msg.data.payurl)
            if(msg.data.payurl)top.location.href=msg.data.payurl;

        },
        error: function () {
            location.href="/personal/login";
        }
    });
}


//获取支付列表
function getPayType(){
    $.ajax({ //异步数据加载
        type: "POST",
        url: postHost+"/post/getPayType",
        xhrFields:{
            withCredentials:true//允许携带cookie
        },
        beforeSend: function () {
            layer2.open({
                type: 2
                , content: '获取中. . .',
                shadeClose: false,
            });
        },
        success: function (msg) {
            if(msg.code == 3){location.href="/personal/login";return false;}  
            layer2.closeAll();

            log(msg);
            $(".touxiang-wrap img").attr("src",msg.data.user.Userimg);
            $(".header .username").html(msg.data.user.Username);
            $(".header .coin").html("金币余额："+msg.data.user.Coin);
            if(msg.data.user.VipDay>0){
                $(".touxiang-wrap").removeClass("novip").addClass("vip");
                $(".header .btn-vip").html("VIP会员到期："+msg.data.user.VipDate);
            }


            var active = "";
            var active_tuijian = "";
            var recharge = "";
            var jinbitext = "";
            var tuijian = '<span class="redTag" style="margin-left: 0.1rem;border-radius:3px; padding:0 3px;color:#fff;background: #d1acd8;">热销</span><span class="blueTag" style="margin-left: 0.1rem;border-radius:3px; padding:0 3px; color:#fff;background: #a1d0d2;">推荐</span>';


            var li = "";
            var lit = "";
            var html = "";
            var comment = msg.data.paylist;
            li = "";lit = $("#paylist").html(); 


            $.each(comment, function (k, v) {
                data = v;
                active = data.isdefault == 1 ? "active":""
                active_tuijian = data.isdefault == 1 ? tuijian:""
                if(data.coinval == 30){
                    recharge = '<span class="span-recharge month">包月会员</span>'
                    jinbitext="";
                }else if(data.coinval == 90){
                    recharge = '<span class="span-recharge jidu">季度会员</span>'
                    jinbitext="";
                }else{
                    recharge = ""
                    jinbitext="金币";
                }

                if(k===0){
                    li += $("#paylistMax").html().replace(/{id}/g, data.id)
                        .replace(/{money}/g, data.money)
                        .replace(/{coin}/g, data.coin)
                        .replace(/{content}/g, data.content)
                }else{
                    li += lit.replace(/{id}/g, data.id)
                        .replace(/{money}/g, data.money)
                        .replace(/{coin}/g, data.coin)
                        .replace(/{content}/g, data.content)
                        .replace(/{active}/g, active)
                        .replace(/{tuijian}/g, active_tuijian)
                        .replace(/{recharge}/g, recharge)
                        .replace(/{jinbitext}/g, jinbitext)
                }
            })  

            $("#paylist").after(li).remove();
            $("#paylistMax").remove();
            
            var paytype =  msg.data.paytype
            $.each(paytype, function (k, v) {
                if(v == 1)$("."+k).show();
            }) 



        },
        error: function () {
            location.replace("/personal/login?noview=1")
        }
    });
}
//判断是否是微信
function isWeiXin(){
    var ua = window.navigator.userAgent.toLowerCase();
    if(ua.match(/MicroMessenger/i) == 'micromessenger'){
        return true;
    }else{
        return false;
    }
}

//微信登录
function wxlogin(data){
    $.ajax({ //异步数据加载
        type: "POST",
        url: postHost+"/post/wxlogin",
        data:data,
        xhrFields:{
            withCredentials:true//允许携带cookie
        },
        success: function (msg) {
            log(msg)
            if(msg.code == 3){
                alert(msg.msg);
                location.href="/personal/login";
                return false;
            }else if(msg.code == 4){
                location.href = "/personal/wxlogin"+"?back="+encodeURIComponent(goback);
            }else if(msg.code == 101){
                $(".tousu-result h2").html(msg.msg);
                $(".tousu-result").show();
                //console.log(msg);return false;
                if(msg && msg.token)localStorage.setItem("token",msg.token); 
                if(isWeiXin()){
                    goin();
                }else{
                    try {
                        window.AndroidJs.showToast("微信登录成功")//app弹窗
                        goin()
                    }catch(err){
                        setTimeout("goin()",100)
                    }
                }
            }else if(msg.code == 102 || msg.code == 103){
                $(".tousu-result h2").html(msg.msg);
                $(".tousu-result").show();
                if(isWeiXin()){
                    goin();
                }else{
                    setTimeout("goin()",2000)
                }
            }else if(msg.code == 104){
                $(".tousu-result").show();
                $(".tousu-result img").attr("src","http://si1.go2yd.com/get-image/0ccFu3GDu1g")
                $(".tousu-result h2").html(msg.msg);
            }else{
                alert(msg.msg);
                location.href="/personal/login";
                return false;
            }
        },
        error: function () {
            location.href="/personal/login";
        }
    });
}

//获取充值消费记录
function getConsumeAjax(postdata){
    $.ajax({ //异步数据加载
        type: "POST",
        url: postHost+"/post/get_consumeajax",
        data:postdata,
        xhrFields:{
            withCredentials:true//允许携带cookie
        },
        success: function (msg) {
            if(msg.code == 3){location.href="/personal/login";return false;}
            if(msg.code == 2)loadEnd = true;//没有记录
            noRepeat = true


            var li = "";
            var lit = "";
            var html = "";
            var comment = msg.data;
            li = "";lit = $("#payloghtml").html(); 
            $.each(comment, function (k, v) {
                data = v;
                li += lit.replace(/{paytext}/g, data.paytext)
                    .replace(/{Stime}/g, data.Stime)
                    .replace(/{coin}/g, data.coin)


            })  
            $("#consume-list").append(li);
            if(!$("#consume-list li").length)$("#consume-list").html('<img src="/public/cartoon/images/remind-'+postdata.type+'.png" alt="">');

        },
        error: function () {
            location.href="/personal/login";
        }
    });


}



//领取任务奖励
function get_reward(type){
    $.ajax({ //异步数据加载
        type: "POST",
        url: postHost+"/post/get_reward",
        data:{type:type},
        xhrFields:{
            withCredentials:true//允许携带cookie
        },
        success: function (msg) {
            if(msg.code == 3){location.href="/personal/login";return false;}            
            $(window).openWindow('提示',msg.msg,'["确认"]')
            if(msg.code == 1)get_lingqu();

        },
        error: function () {
            location.href="/personal/login";
        }
    });

}

//获取福利中心任务中心领取阅币状态
function get_lingqu(){
    $.ajax({ //异步数据加载
        type: "POST",
        url: postHost+"/post/get_lingqu",
        xhrFields:{
            withCredentials:true//允许携带cookie
        },
        success: function (msg) {
            if(msg.code == 3){location.href="/personal/login";return false;}
            log(msg)
            for(var i=0;i<msg.data.qiandao_num;i++)$('.num-'+(i+1)).addClass('active');
            var qiandaojinbi = msg.data.qiandao_num*10+10;
            if(qiandaojinbi>70)qiandaojinbi=70;

            $("#today-reward").html(msg.data.allcoin_num);
            $(".lingqu-qiandao span").html("(金币+"+qiandaojinbi+")");//今日签到奖励金币
            $(".comment").html("(金币+"+msg.data.comment.getcoin+")");//设置评论奖励金币
            $(".read").html("(金币+"+msg.data.read.getcoin+")");//设置评论奖励金币
            $(".commitgood").html("(金币+"+msg.data.commitgood.getcoin+")");//点赞评论奖励金币

            $(".good_cartoon").html("(金币+"+msg.data.good_cartoon.getcoin+")");//点赞漫画奖励金币
            $(".first_collect").html("(金币+"+msg.data.first_collect.getcoin+")");//收藏漫画奖励金币
            $(".first_phone").html("(金币+"+msg.data.first_phone.getcoin+")");//绑定手机 奖励金币
            $(".first_weixin").html("(金币+"+msg.data.first_weixin.getcoin+")");//绑定微信 奖励金币



            //判断签到
            if(msg.data.qiandao && msg.data.qiandao.typeof && msg.data.qiandao.typeof == 2){
                $('.lingqu-qiandao').removeClass('lingqu')
                $('.lingqu-qiandao').addClass('yiwancheng')
                $('.bt_qiandao').css("display",'none');
                $('.qiandao').css('display','block');
                if(qiandaojinbi==70){
                    qiandaojinbi=70;
                }else{
                    qiandaojinbi = qiandaojinbi-10;
                }
                $(".lingqu-qiandao span").html("(金币+"+qiandaojinbi+")");//今日签到奖励金币
            }

            //判断评论
            if(msg.data.comment && msg.data.comment.typeof){
                if(msg.data.comment.typeof == 1)$(".comment").parent().removeClass().addClass('lingqu')
                if(msg.data.comment.typeof == 2)$(".comment").parent().removeClass().addClass('yiwancheng')
            }
            //点赞评论
            if(msg.data.commitgood && msg.data.commitgood.typeof){
                if(msg.data.commitgood.typeof == 1)$(".commitgood").parent().removeClass().addClass('lingqu')
                if(msg.data.commitgood.typeof == 2)$(".commitgood").parent().removeClass().addClass('yiwancheng')
            }
            //阅读一本漫画
            if(msg.data.read && msg.data.read.typeof){
                if(msg.data.read.typeof == 1)$(".read").parent().removeClass().addClass('lingqu')
                if(msg.data.read.typeof == 2)$(".read").parent().removeClass().addClass('yiwancheng')
            }
            //新手任务 点赞漫画
            if(msg.data.good_cartoon && msg.data.good_cartoon.typeof){
                if(msg.data.good_cartoon.typeof == 1)$(".good_cartoon").parent().removeClass().addClass('lingqu')
                if(msg.data.good_cartoon.typeof == 2)$(".good_cartoon").parent().removeClass().addClass('yiwancheng')
            }
            //新手任务 收藏漫画
            if(msg.data.first_collect && msg.data.first_collect.typeof){
                if(msg.data.first_collect.typeof == 1)$(".first_collect").parent().removeClass().addClass('lingqu')
                if(msg.data.first_collect.typeof == 2)$(".first_collect").parent().removeClass().addClass('yiwancheng')
            }
            //新手任务 绑定手机
            if(msg.data.first_phone && msg.data.first_phone.typeof){
                if(msg.data.first_phone.typeof == 1)$(".first_phone").parent().removeClass().addClass('lingqu')
                if(msg.data.first_phone.typeof == 2)$(".first_phone").parent().removeClass().addClass('yiwancheng')
            }
            //新手任务 绑定微信
            if(msg.data.first_weixin && msg.data.first_weixin.typeof){
                if(msg.data.first_weixin.typeof == 1)$(".first_weixin").parent().removeClass().addClass('lingqu')
                if(msg.data.first_weixin.typeof == 2)$(".first_weixin").parent().removeClass().addClass('yiwancheng')
            }
            
            
            if(msg.data.wxfz && msg.data.wxfz.show == 1){
                $(".wxfz .wxrenwu").attr("href",msg.data.wxfz.url);
                //$(".wxfz").show();
            }


        },
        error: function () {
            location.href="/personal/login";
        }
    });



}


//获取搜索结果
function Searchlist(data){
    $.ajax({ 
        type: "POST",
        url: postHost+"/post/GetInfo",
        data: data,
        xhrFields:{
            withCredentials:true//允许携带cookie
        },
        beforeSend: function () {
            alertBox.innerHTML = "搜索中..";
            alertBox.style.display = "block";
        },
        success: function (msg) {
            alertBox.style.display = "none";
            console.log(msg);
            //if((!msg.data || msg.data.length<40) && !$(".portrait li").length)$('.refresh').click();//获取推荐 如果收藏或者历史数量超过40就不推荐了 太多了

            var li = "";
            var lit = "";
            var html = "";
            var obj = $("#searchthtml");
            var comment = msg.data;
            msg.data?$(".search-result").removeClass("none"):$(".search-result").addClass("none");
            li = "";lit = obj.html(); 
            $.each(comment, function (k, v) {
                data = v;
                li += lit.replace(/{ImgUrl}/g, data.ImgUrl)
                    .replace(/{Title}/g, data.Title)
                    .replace(/{LinkUrl}/g, data.LinkUrl)
            })  
            $(".search-result ul").empty();
            $(".search-result ul").append(li);


            $(".search-result").show();
            $(".search-history").hide();
        }
    });
}

//获取历史和收藏bookcase.php
function GetBook(indexnum){
    log(indexnum);

    var obj = $("#shujia_contenthtml");
    if(indexnum == 1)obj = $("#shujia_historyhtml");

    if(obj.length<=0)return false;
    $.ajax({ 
        type: "POST",
        url: postHost+"/post/GetBook",
        data: {index:indexnum},
        xhrFields:{
            withCredentials:true//允许携带cookie
        },
        success: function (msg) {
            console.log(msg);
            if((!msg.data || msg.data.length<40) && !$(".portrait li").length)$('.refresh').click();//获取推荐 如果收藏或者历史数量超过40就不推荐了 太多了

            var IsUpdate;

            var li = "";
            var lit = "";
            var html = "";
            var comment = msg.data;
            li = "";lit = obj.html(); 
            $.each(comment, function (k, v) {
                data = v;
                IsUpdate = data.IsUpdate == 2?"display:inline":""
                log(IsUpdate)
                li += lit.replace(/{ImgUrl}/g, data.ImgUrl)
                    .replace(/{Title}/g, data.Title)
                    .replace(/{LinkUrl}/g, data.LinkUrl)
                    .replace(/{GoLinkUrl}/g, data.GoLinkUrl)
                    .replace(/{LChapter}/g, data.LChapter)
                    .replace(/{UserBookId}/g, data.UserBookId)
                    .replace(/{CIndex}/g, data.CIndex)
                    .replace(/{Tap}/g, data.Tap)
                    .replace(/{IsUpdate}/g, IsUpdate)
            })  
            obj.after(li).remove();

            if(indexnum === 0)$('.shoucang-history .shujia-list li a').length>0?$('.shoucang-history .shoucang-none').hide():$('.shoucang-history .shoucang-none').show()
            if(indexnum === 1)$('.read-history .shujia-list li a').length>0?$('.read-history .read-none').hide():$('.read-history .read-none').show()

            $('.shujia-header a').eq(indexnum).click();
            if(window.edit)return false;


        }
    });

}

//漫画点赞 info.php
function Good_num(data,obj){
    console.log(data)
    $.ajax({ 
        type: "POST",
        url: postHost+"/post/good_num",
        data: data,
        xhrFields:{
            withCredentials:true//允许携带cookie
        },
        success: function (msg) {
            console.log(msg);
            var text =$('#good-num').siblings('span').text()
            text =Number(text)

            if (obj.parent().hasClass('active')) {
                $('#good-num').siblings('span').text(text-1)
                $('#good-num').attr('src','/public/cartoon/images/dianzan_yewei.png')
                obj.parent().removeClass('active');
            } else{
                $('#good-num').siblings('span').text(text+1)
                $('#good-num').attr('src','/public/cartoon/images/dianzan-yellow_yewei.png')
                obj.parent().addClass('active');
            }
            $('.dianzan').toggleClass('active');
        }
    });

}

//评论点赞 allcomments.php

function CommitGood(data,obj){
    console.log(data)
    $.ajax({ 
        type: "POST",
        url: postHost+"/post/commitgood",
        data: data,
        xhrFields:{
            withCredentials:true//允许携带cookie
        },
        success: function (msg) {
            console.log(msg);
            var goodNum = parseInt(obj.find('span').html());

            if (obj.parent().hasClass('active')) {
                obj.find('span').html(goodNum - 1);
                obj.parent().removeClass('active');
            } else{
                obj.find('span').html(goodNum + 1);
                obj.parent().addClass('active');
            }
        }
    });

}


//获取全部评论allcomments.php
function GetComment(data){
    console.log(data)
    $.ajax({ 
        type: "POST",
        url: postHost+"/post/GetComment",
        data: data,
        xhrFields:{
            withCredentials:true//允许携带cookie
        },
        success: function (msg) {

            var li = "";
            var lit = "";
            var html = "";
            console.log(msg)
            var comment = msg.data;
            li = "";lit = $("#commenthtml").html(); 
            $.each(comment, function (k, v) {
                data = v;
                li += lit.replace(/{Userimg}/g, data.user.Userimg)
                    .replace(/{Username}/g, data.user.Username)
                    .replace(/{comment}/g, data.comment)
                    .replace(/{Stime}/g, data.Stime)
                    .replace(/{zan}/g, data.zan)
                    .replace(/{bookid}/g, data.vid)
                    .replace(/{reviewid}/g, data.id)
                    .replace(/{active}/g, data.active)


            })  
            $("#commenthtml").after(li).remove();
        }
    });


}

/*
判断来源是否是login登录页面而来，如果是就返回直接跳转到首页
obj 设置href的a的属性
urldata 来源链接包含该字段就跳转
href 包含修改跳转url
*/
function goback(obj,urldata,href){
    var back = document.referrer.split('/');
    $.each(back, function (k, v) {
        if(v.indexOf(urldata) >=0){
            obj.attr("href",href);
            return false;
        }
        /*
    	log(v)
    	if(v == urldata){
            obj.attr("href",href);
            return false;
        }
        */
    })
}

function getnoback(urldata,href){

    var back = document.referrer.split('/');
    $.each(back, function (k, v) {
        if(v.indexOf(urldata) >=0){
            obj.attr("href",href);
            return false;
        }
        /*
    	log(v)
    	if(v == urldata){
            obj.attr("href",href);
            return false;
        }
        */
    })


}

//输出显示
function log(data){
    return false;
    console.log(data);
}

//评论
function Commit(data){
    console.log(data)
    $.ajax({ 
        type: "POST",
        url: postHost+"/post/commit",
        data: data,
        xhrFields:{
            withCredentials:true//允许携带cookie
        },
        success: function (msg) {
            console.log(msg);
            var gourl = "/book/info/id/"+data.bookid;
            $(window).openWindow('提示',msg.msg,'["确认"]', function () {
                window.location.href = gourl;
            })
        }
    });
}

//退出
function LoginOut(){
    $.ajax({ 
        type: "POST",
        url: postHost+"/post/LoginOut",
        xhrFields:{
            withCredentials:true//允许携带cookie
        },
        success: function (msg) {
            console.log(msg);
            if(msg.code === 0){
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                try {
                    window.AndroidJs.showToast("退出成功")
                    location.replace("/personal/login?noview=1")
                }catch(err){
                    layer.msg('退出成功');
                    setTimeout(function(){ location.replace("/personal/login?noview=1") }, 1000);
                }
            }
        }, 
        error: function () {
            layer.msg('退出失败！请稍后重试');
        }
    });

}


//获取用户信息 
function GetUser(action){
    $.ajax({ //异步数据加载
        type: "POST",
        url: postHost+"/post/GetUser",
        xhrFields:{
            withCredentials:true//允许携带cookie
        },
        success: function (msg) {
            console.log(msg);
            if(action == "info"){
                var token = localStorage.getItem("token");
                if(msg.code == 1)msg = LoginByToken(token);
             
                
                console.log(msg,action,token);
                if(msg.code === 0){//登录成功
                    localStorage.setItem("user",JSON.stringify(msg)); 
                    GetUserInfo(msg);

                }else if(msg.code == 1){//已经退出
                    localStorage.removeItem('user');
                    if(token){
                        localStorage.removeItem('token');
                    	layer.msg('用户已在其他地方登录');
                    }else{
                    	layer.msg('用户登录信息已过期，请重新登录');
                    }
                    location.replace("/personal/login?noview=1");
                }else{
                    layer.msg('用户信息获取失败！请刷新');
                }
                
                
                
            }
            if(action == "commit" && msg.code !== 0)location.replace("/personal/login?noview=1");

        }
    });
}
function LoginByToken(token) {
    var i = this;
    var msgdata;

    $.ajax({
        url: postHost+"/post/LoginByToken",
        data: {"token":token},
        type: "POST",
        async:false,
        dataType: "json",
        xhrFields:{
            withCredentials:true
        },
        success: function (msg) {
            msgdata = msg;
        }, 
        error: function () {
        }
    });

    return msgdata;
}
function LoginUserByPid(){
    try {
        var phonemsg = window.AndroidJs.GetOtherMsg()
        var obj = eval('(' + phonemsg + ')');
        var pid = obj.ANDROID_ID+obj.MIMI_ID
        window.AndroidJs.showToast(pid)
    }catch(err){
        console.log("tryerr")
        //在这里处理错误
    }
}
//检测是否可以意见登录
function isLoginUserByPid(){
    try {
        var pid = window.AndroidJs.GetAndroidid();
        if(pid.length>10){
            $(".midbtn").show();
            $("#pid").val(pid);
        }
        /*
        var phonemsg = window.AndroidJs.GetOtherMsg()
        var obj = eval('(' + phonemsg + ')');
        var pid = obj.ANDROID_ID+obj.MIMI_ID
        if(pid)$(".midbtn").show();
        */
        //var msgobj = phonemsg.parseJSON();
        //console.log(obj)
        //window.AndroidJs.showToast(pid)
        /*
        var header = '{}'; 
        var aaaa = window.AndroidJs.Internet("https://appapi.tititoy6688.com/poster/getList?type=loading","POST",header,5000)
        window.AndroidJs.showToast(aaaa)
        */
        //var bbbb = window.AndroidJs.GetOtherMsg() 
        //window.AndroidJs.showToast(bbbb)
    }catch(err){
        console.log("tryerr")
        //在这里处理错误
    }

}

function onResume(viewurl){//webview恢复，APP回调给h5页面说说页面恢复了
    try {
        if(viewurl.indexOf("personal/info")>0){
            if(!localStorage.getItem("token"))location.replace("/personal/login?noview=1")//用户信息不存在就跳转登录
            //window.AndroidJs.showToast(viewurl) 
        }
    }catch(err){//在这里处理错误
        
    }

} 
//操作个人中心
function GetUserInfo(msg){
    if(msg.code == 1){//未登录直接跳转
        location.replace("/personal/login?noview=1");
        return false;
    }

    if(msg.code == 0){
        $(".header .touxiang img").attr("src",msg.data.Userimg);
        $(".header p").html(msg.data.Username);
        $(".header span").html("ID:"+msg.data.id);

        $(".middle .active").eq(0).find("span").html(msg.data.Coin+"金币");
        if(msg.data.VipDay>0){
            $(".middle .active").eq(2).find("span").html(msg.data.VipDate+"到期");
            $(".middle .active").eq(2).find("img").attr("src","/public/cartoon/images/nianfei.png");
        }
        if(!msg.data.Mobile)$(".mobile").show();
        if(!msg.data.Openid)$(".openid").show();

        if(msg.data.Openid){
            $(".resetweixin").attr("href","javascript:;").html("微信已绑定");
        }
        if(msg.data.Mobile){
            $(".resetmobile").attr("href","javascript:;").html("已绑定："+msg.data.Mobile);
        }

        if(msg.data.Sex == 2)$(".header .xingbie").attr("src","/public/cartoon/images/nv.png");


    }


}

//read页面 获取章节内容readOnload.php

function readOnload(bookid,chapterid){
    console.log(bookid,chapterid);

    var data = { "bookid": bookid, "chapterid": chapterid};

    $.ajax({ //异步数据加载
        type: "POST",
        url: postHost+"/post/readOnload",
        dataType: "json",
        data: data,
        xhrFields:{
            withCredentials:true//允许携带cookie
        },
        beforeSend: function () {
            alertBox.innerHTML = "加载中..";
            alertBox.style.display = "block";
        },
        success: function (msg) {
            console.log(msg)
            alertBox.style.display = "none";


            if(msg.shoucan == 1)$('.collect').addClass('active');
            if(msg.dianzan == 1)$('#good-num').attr('src','/public/cartoon/images/dianzan-yellow_yewei.png'),$('#good-num').parent().addClass('active');
            //上一话
            if(msg.ret_up_down.up){
                $(".pre_chapter").attr("href","/chapter/read/"+bookid+"/"+msg.ret_up_down.up);
            }else{
                $(".pre_chapter p").html("没有了");
                $(".pre_chapter").parent().removeClass('active');
            }
            //下一话
            if(msg.ret_up_down.down){
                $(".next_chapter").attr("href","/chapter/read/"+bookid+"/"+msg.ret_up_down.down);
            }else{
                $(".next_chapter p").html("没有了");
                $(".next_chapter").parent().removeClass('active');
            }

            $(".header-content h2").html(msg.name);//设置标题
            $(".good_num").html(msg.commit_zan.ZanNum);
            $(".CommentNum").html(msg.commit_zan.CommentNum);
            document.title = msg.name + " - " +msg.commit_zan.Title;

            var html = '';//'<h2 class="chaptername">'+msg.name+'</h2>';
            var im = JSON.parse(msg.imglist);
            var tw = parseInt($("#showimgcontent").width());


            $(".tixing-middle span").html(msg.coin);
            $(".tixing-yue span").html(msg.usercoin);
            if(im == null || im.length<1){
                msg.userid ? $(".tixinggoumai").eq(1).show():$(".tixinggoumai").eq(0).show()
            }

            $.each(im, function (k, v) {
                html +='<img width="100%" class="lazy" data-original="'+v.u+'">';
            })
            $(".container").html(html);

            $("img.lazy").lazyload({
                timeout: 10000,
                placeholder: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAu4AAAKACAMAAAD0PQ3SAAADKGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxMzggNzkuMTU5ODI0LCAyMDE2LzA5LzE0LTAxOjA5OjAxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNyAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpEQ0MzQkQ4M0ZBQUExMUU4QkM3RUY5RDk3RTBCOUFDQiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpEQ0MzQkQ4NEZBQUExMUU4QkM3RUY5RDk3RTBCOUFDQiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkRDQzNCRDgxRkFBQTExRThCQzdFRjlEOTdFMEI5QUNCIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkRDQzNCRDgyRkFBQTExRThCQzdFRjlEOTdFMEI5QUNCIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+0Zv+YAAAAC1QTFRFR3BMUVFRXV1dYWFhXV1dZmZmZmZmZmZmMzMzMzMzZmZmZmZmMzMz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",
                errorholder: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAu4AAAKACAMAAAD0PQ3SAAADKGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxMzggNzkuMTU5ODI0LCAyMDE2LzA5LzE0LTAxOjA5OjAxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNyAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDozN0EzMUFDQUZBQUIxMUU4QkM3RUY5RDk3RTBCOUFDQiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDozN0EzMUFDQkZBQUIxMUU4QkM3RUY5RDk3RTBCOUFDQiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkRDQzNCRDg5RkFBQTExRThCQzdFRjlEOTdFMEI5QUNCIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkRDQzNCRDhBRkFBQTExRThCQzdFRjlEOTdFMEI5QUNCIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+6n6i7gAAADxQTFRFR3BMZmZmMzMzMzMzdnZ2aGhoWVlZMzMzMzMzmZmZZmZmmZmZmZmZ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"
            })
            $("img.lazy").on('load', function () {
                var loaded = $(this).attr('src').indexOf('jiazai.png') >= 0
                !loaded && $(this).css('min-height', 'unset')
                !loaded && $(this).css('width', '100%')
                })

            chaptercxid = msg.index

        },
        error: function () {
            $(window).openWindow('提示','网络异常，请稍后重试','["确认"]', function () {
                location.href="/"
            }, true)
        }

    });


}

//info页面加载 infoOnload.php
function infoOnload(bookid) {
    var data = { "bookid": bookid};
    $.ajax({ //异步数据加载
        type: "POST",
        data:data,
        xhrFields:{
            withCredentials:true//允许携带cookie
        },
        beforeSend: function () {
            alertBox.innerHTML = "加载中..";
            alertBox.style.display = "block";
        },
        url: postHost+"/post/infoOnload",
        success: function (msg) {    
            alertBox.style.display = "none";
            console.log(msg);  
            if(msg.code == 1){location.href="/";return false;}
            if(msg.code == 2){
                $(window).openWindow('提示','该漫画未发布','["确认"]', function () {
                    location.href="/"
                }, true)
                return false;
            }


            var li = "";
            var lit = "";
            var html = "";

            var data; 
            //li = "";lit = $("#bookhtml").html(); 



            //设置漫画信息
            var data = msg.manhua;
            paynum = data.paynum;
            for(j = 0,Tap = data.Tap,len=Tap.length,Taphtml=''; j < len; j++) { if(j<4)Taphtml+='<span>'+Tap[j]+'</span>'}//标签


            html = $("#bookhead").html()
            html = html.replace(/{SubImgUrl}/g, data.SubImgUrl)
                .replace(/{Title}/g, data.Title)
                .replace(/{Taphtml}/g, Taphtml)
                .replace(/{Looknum}/g, data.Looknum)
                .replace(/{ZanNum}/g, data.ZanNum)
                .replace(/{Upstr}/g, data.Upstr)
                .replace(/{Upindex}/g, data.Upindex)
            $("#bookhead").after(html).remove();


            //html = $("#abstract").html().replace(/{Summary}/g, data.Summary)
            //$("#abstract").after(html).remove();
            html = $("#catalog").html().replace(/{uptime}/g, data.Uptime)
            $("#catalog").after(html).remove();

            document.title = data.Title;
            $(".book-abstract p").html("作品简介："+data.Summary);
            Taps = data.Tap;
            guessLike(bookid,Taps)

            $(".foot-right a").attr("href","/chapter/read/"+bookid+"/");

            //设置收藏
            if(data.shoucan === 1){
                $('.shoucang').toggleClass('active');
                if(data.shoucanjilu.Cid*1>0){
                    $(".foot-right a").html("继续阅读 - 第"+data.shoucanjilu.Cidx+"话");
                    $(".foot-right a").attr("href","/chapter/read/"+bookid+"/"+data.shoucanjilu.Cid);
                }
            }
            //设置点赞
            if(data.dianzan === 1)$('.dianzan').toggleClass('active');
            //设置评论
            $(".CommentNum").html(data.CommentNum);//评论数

            var comment = data.comment;
            li = "";lit = $("#commenthtml").html(); 
            $.each(comment, function (k, v) {
                data = v;
                li += lit.replace(/{Userimg}/g, data.user.Userimg)
                    .replace(/{Username}/g, data.user.Username)
                    .replace(/{comment}/g, data.comment)
                    .replace(/{Stime}/g, data.Stime)
                    .replace(/{zan}/g, data.zan)
                    .replace(/{bookid}/g, data.vid)
                    .replace(/{reviewid}/g, data.id)
                    .replace(/{active}/g, data.active)
            })  
            $("#commenthtml").after(li).remove();
            if(comment && comment.length>0)$(".pinglunkuang").hide(),$(".book-comments-more").show(),$(".book-comments-more a").attr("href","/book/allcomments/bookid/"+bookid);
            goback($(".returnhistory"),"read","/");//判断来源来设置返回跳转
        }
    });
}



//info页面加载 listOnload.php 获取漫画目录
function listOnload(bookid) {
    var data = { "bookid": bookid};
    $.ajax({ //异步数据加载
        type: "POST",
        data:data,
        url: postHost+"/post/listOnload",
        xhrFields:{
            withCredentials:true//允许携带cookie
        },
        success: function (msg) {    
            console.log(msg);  
            if(msg.code == 1)return false;

            var li = "";
            var lit = "";
            var html = "";

            var data; 

            li = "";lit = $("#abstract").html(); 
            $.each(msg.lists, function (k, v) {
                data = v;
                var display0 = data.ChapterStatus == 0 ? "":"display:none"
                var display1 = data.ChapterStatus == 1 ? "":"display:none"
                var display2 = data.ChapterStatus == 2 ? "":"display:none"
                var displayv = data.ChapterStatus >0 ? "":"display:none"
                li += lit.replace(/{Linkurl}/g, data.Linkurl)
                    .replace(/{ImgUrl}/g, data.ImgUrl)
                    .replace(/{Name}/g, data.Name)
                    .replace(/{Uptime}/g, data.Uptime)
                    .replace(/{displayv}/g, displayv)
                    .replace(/{display0}/g, display0)
                    .replace(/{display1}/g, display1)
                    .replace(/{display2}/g, display2)
                    .replace(/{Paynum}/g, data.Paynum)
                    .replace(/{Cname}/g, data.Cname)

            })  
            //设置漫画信息
            $("#abstract").after(li).remove();

            $("img.lazy").lazyload({
                timeout: 10000,
                threshold :1000
            })

            if(msg.progress>50)$('.catalog-time-right .dao').click();//收藏阅读超过一半就倒序

        }
    });
}

//index首页加载
function indexOnload() {
    $.ajax({ //异步数据加载
        type: "POST",
        url: postHost+"/post/indexOnload",
        xhrFields:{
            withCredentials:true//允许携带cookie
        },
        success: function (msg) {
            var li = "";
            var lit = "";
            var html = "";

            //console.log(li);
            //====幻灯片
            li = "";lit = $("#swiper").html();       
            $.each(msg.swiper.list, function (k, v) {
                li += lit.replace(/{link}/g, v.link).replace(/{imgurl}/g, v.imgurl);
            })     
            $("#swiper").after(li).remove();
            //设置幻灯片滚动
            var mySwiper = new Swiper('.swiper-container', {
                autoplay: {
                    delay: 4000,
                    disableOnInteraction: false
                },
                speed: 300,
                loop: true,
                pagination: {
                    el: '.swiper-pagination',
                }
            })


            //====本周头牌
            li = "";lit = $("#lithtml").html();
            $.each(msg.body_1.list, function (k, v) {
                li += lit.replace(/{link}/g, v.LinkUrl).replace(/{imgurl}/g, v.SubImgUrl).replace(/{title}/g, v.Title).replace(/{summary}/g, v.Summary); 
            })
            html = $("#body_1").html().replace(/{content}/g, li).replace(/{name}/g, msg.body_1.name);
            $("#body_1").after(html).remove();

            //====宅男专区
            li = "";lit = $("#lithtml").html();var headhtml = $("#headhtml").html();
            $.each(msg.body_2.list, function (k, v) {
                if(k<1)headhtml = headhtml.replace(/{link}/g, v.LinkUrl).replace(/{imgurl}/g, v.SubImgUrl).replace(/{title}/g, v.Title).replace(/{looknum}/g, v.Looknum).replace(/{summary}/g, v.Summary); 
                if(k>=1)li += lit.replace(/{link}/g, v.LinkUrl).replace(/{imgurl}/g, v.ImgUrl).replace(/{title}/g, v.Title).replace(/{summary}/g, v.Summary); 
            })
            html = $("#body_2").html().replace(/{headhtml}/g, headhtml).replace(/{content}/g, li).replace(/{name}/g, msg.body_2.name);
            $("#body_2").after(html).remove();

            //====少女恋爱
            li = "";lit = $("#lithtml").html();
            $.each(msg.body_3.list, function (k, v) {
                li += lit.replace(/{link}/g, v.LinkUrl).replace(/{imgurl}/g, v.SubImgUrl).replace(/{title}/g, v.Title).replace(/{summary}/g, v.Summary); 
            })
            html = $("#body_3").html().replace(/{content}/g, li).replace(/{name}/g, msg.body_3.name);
            $("#body_3").after(html).remove();

            //====抢看新作E
            li = "";lit = $("#lithtml").html();
            $.each(msg.body_4.list, function (k, v) {
                li += lit.replace(/{link}/g, v.LinkUrl).replace(/{imgurl}/g, v.ImgUrl).replace(/{title}/g, v.Title).replace(/{summary}/g, v.Summary); 
            })
            html = $("#body_4").html().replace(/{content}/g, li).replace(/{name}/g, msg.body_4.name);
            $("#body_4").after(html).remove();

            //====惊悚悬疑
            li = "";lit = $("#lithtml").html();
            $.each(msg.body_5.list, function (k, v) {
                li += lit.replace(/{link}/g, v.LinkUrl).replace(/{imgurl}/g, v.ImgUrl).replace(/{title}/g, v.Title).replace(/{summary}/g, v.Summary); 
            })
            html = $("#body_5").html().replace(/{content}/g, li).replace(/{name}/g, msg.body_5.name);
            $("#body_5").after(html).remove();

            //====真人专区
            li = "";lit = $("#lithtml").html();
            $.each(msg.body_6.list, function (k, v) {
                li += lit.replace(/{link}/g, v.LinkUrl).replace(/{imgurl}/g, v.SubImgUrl).replace(/{title}/g, v.Title).replace(/{summary}/g, v.Summary); 
            })
            html = $("#body_6").html().replace(/{content}/g, li).replace(/{name}/g, msg.body_6.name);
            $("#body_6").after(html).remove();

        }
    });
}