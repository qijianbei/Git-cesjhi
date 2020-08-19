var novelId = $('#NovelId').val();
var sectionNum = $('#SectionNo').val() || 0;
var defaultSectionNo = $('#DefaultSectionNo').val() || 1;
var baseurl = location.href.split('?')[0].replace('/Home/Detail', '');
var url = location.href.split('#')[0];
var novelImgUrl = '';
var novelDesc = '';
var novelName = '';
var publicName = '';
var signCoin = 0;
var shareCoin = 0;
$(function () {
    $.post('/Home/Detail?novelId=' + novelId + '&novelTitleNo=' + sectionNum + '&defaultSectionNo=' + defaultSectionNo, function (data) {
        switch (data.code) {
            case 0:
                loadSuccess(data.data);
                break;
            case 10000:
                //window.location.href = "/Home/Index";
                window.location.href = "/Home/NovelState?t=3";
                break;
            case 10001:
                window.location.href = "/Home/NovelState?t=1&novelName=" + data.data;
                break;
            case 10002:
                window.location.href = "/Home/NovelState?t=2&novelName=" + data.data;
                break;
            case 10003:
                window.location.href = "/Home/NovelState?t=3&novelName=" + data.data;
                break;
            case 10004:
                window.location.href = data.data;
                break;
            case 10005:
                var content = '<h5 style="text-align:center;color:#333333; margin-bottom:10px;">温馨提示</h5>' +
                    '<span style="font-size:14px;color:#888888;">' + data.msg + '</span>';
                if (data.data.isAll === 0) {
                    content += '<br/><label><input onchange="changeAutobuy(this)" id="autoBuy" type="checkbox" style=""/>开启自动购买</label>';
                }

                //弹窗提示支付;
                layer.open({
                    content: content,
                    btn: ['好的', '再想想'],
                    one: function (index) {
                        if (autobuy) {
                            $.post('/User/AutoBuy', { a: 1 });
                        }
                        $.post('/Home/PurchaseAll?novelId=' + novelId + "&sectionNo=" + data.data.sectionNum + "&money=" + data.data.money, function (data) {
                            if (data.code === 10004) {
                                layer.close(index);
                                mui.toast('支付成功');
                                setTimeout(function () {
                                    window.location.reload(true);
                                }, 500);
                            } else if (data.code === 0) {
                                 window.location.href = data.data;
                                
                            }
                        });
                    },
                    two: function (index) {
                        window.location.href = '/Home/NovelIndex?novelId=' + novelId;
                    }
                });
                break;
        }
    });
    var $img = $('<img style="bottom:80px;" alt="Top_arrow" class="top_arrow" id="top_arrow" src="/Content/wechat/sup_dr_com/images/y-top.png" />');
    $("body").append($img);
    $(window).scroll(
        function () {
            $(window).scrollTop() > 20 ? $img.fadeIn(400) : $img.fadeOut(400);
        });
    $("body, html").scroll(
        function () {
            $("body,html").scrollTop() > 20 ? $img.fadeIn(400) : $img.fadeOut(400);
        });
    $img.click(
        function () {
            $("body,html").animate({ scrollTop: 0 }, 400);
        });
});
var autobuy = false;
function changeAutobuy(obj) {
    autobuy = obj.checked;
}
var isShow = false;
$('#essay').click(function () {
    if (isShow) {
        $('.yunweidu-header').animate({
            'top': "-44px"
        });
        $('.yunweidu-footer').animate({
            'bottom': "-44px"
        });
        $('.need-hide').fadeOut(400);
        isShow = false;
    } else {
        $('.yunweidu-header').animate({
            'top': "0"
        });
        $('.yunweidu-footer').animate({
            'bottom': "0"
        });
        $('.need-hide').fadeIn(400);
        isShow = true;
    }
});
function loadSuccess(data) {
    publicName = data.WechatPublicName;
    novelImgUrl = data.detail.ImgUrl;
    novelDesc = data.detail.Description;
    novelName = data.detail.NovelName;
    sectionNum = data.detail.SectionNum;
    signCoin = data.signCoin;
    shareCoin = data.shareCoin;
    $('title').html(novelName + ' - ' + sectionNum + ' 话 ');
    $('.head-title').html('第 ' + sectionNum + ' 话 ' + data.detail.TitleName);
    $('.essay-content').html(data.detail.TitleContent);
    var pageUrl = '/Home/Detail?NovelId=' + novelId + '&novelTitleNo=';
    $("#lastPage,#lastPageMenu").attr('href', pageUrl + (sectionNum - 1));
    $("#nextPage,#nextPageMenu").attr('href', pageUrl + (sectionNum + 1));
    if (sectionNum < 2) {
        $("#lastPage").css('visibility', 'hidden');
    }
    $('.section-tool').show();
    if (publicName !== '' && data.isSubscribe !== 1) {
        $('.how-continue').show();
    } else {
        $('.fixed-to-home').css('bottom', '180px');
        $('.fixed-to-jubao').css('bottom', '130px');
    }
    if (data.isManhua === true) {
        $('.my-sels').addClass('manhua');
        $('.essay').addClass('manhua');
    } else {
        $('.my-sels').addClass('xiaoshuo');
        $('.essay').addClass('xiaoshuo');
    }
    if (data.isMarked === true) {
        $('#wshoucang-icon-btn').hide();
        $('#yshoucang-icon-btn').show();
    } else {
        $('#wshoucang-icon-btn').show();
        $('#yshoucang-icon-btn').hide();
    }
    Sign();
    if (data.showSubscribe === 1) {
        ShowSubscribe();
    }
    //广告获取
    $.post("/Ads/Gets", {}, function (d) {
        if (d.code === 1038) {
            return;
        }
        showAd(d.data);
    });
    share();
}
function Sign() {
    var signDate = getCookie("signDate");
    if (signDate !== getCurDateStr()) {
        //若今日未签到，则签到
        $.post('/Home/SignJson', "", function (data) {
            if (parseInt(data.code) === 0) {
                setCookie('signDate', getCurDateStr());
                layer.open({
                    content: '<h5 style="text-align:center;color:#333333; margin-bottom:10px;">签到成功</h5><span style="font-size:14px;color:#888888;">签到成功！恭喜获得 ' + signCoin + ' 金币！</span>',
                    btn: '我知道啦',
                    one: function (index) {
                        layer.close(index);
                    }
                });
            } else if (parseInt(data.code) === 1098) {
                setCookie('signDate', getCurDateStr());
            }
        });
    }
}

function howContinue() {
    layer.open({
        content: '<div style="text-align:center;"><p style="font-size:16px;">如何追书？</p>' +
            '<div style="color:darkorange;font-size:14px;">关注作者授权公众号，方便下次阅读</div>' +
            '<img width="80%" src="https://open.weixin.qq.com/qr/code?username=' + publicName + '"/>' +
            '<div style="font-size:14px;">长按识别上方二维码关注</div></div>',
        btn: '明天再说啦',
        one: function (index) {
            layer.close(index);
        }
    });
}

function ShowSubscribe() {
    //看看这部小说今天有没有弹起过，一天一篇小说只弹一次
    var sectionHintDate = getCookie("Novel_" + novelId);
    if (sectionHintDate !== getCurDateStr()) {
        setCookie("Novel_" + novelId, getCurDateStr());
        howContinue();
    }
}

function showAd(ads) {
    var str1 = '';
    var str2 = "";
    var str3 = "";
    for (var i in ads) {
        if (ads.hasOwnProperty(i)) {
            switch (ads[i].AdPosition) {
                case 1:
                    if (ads[i].AdType == 3) {
                        str1 = ads[i].Detail;
                    } else {
                        str1 += '<a href="' + ads[i].LinkUrl + '" target="_blank"><img width="100%" src="' + ads[i].ImgUrl + '"/></a>';
                    }
                    break;
                case 2:
                    str2 += '<a href="' + ads[i].LinkUrl + '" target="_blank"><img width="100%" src="' + ads[i].ImgUrl + '"/></a>';
                    break;
                case 3:
                    str3 += '<a href="' + ads[i].LinkUrl + '" target="_blank"><img width="100%" src="' + ads[i].ImgUrl + '"/></a>';
                    break;
            }
        }
    }
    $(".ad-top").html(str1);
    var mid = parseInt($(".essay-content").children().length / 2);
    $(".essay-content").children(":eq(" + mid + ")").after(str2);
    $(".ad-bottom").html(str3);
}
function getCurDateStr() {
    var date = new Date();
    return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
}

$("#menu-btn,.menu-btn").click(function () {
    mui("#menulist").popover('toggle');
});
$('#novel-div,#backToList').click(function () {
    var novelId = this.getAttribute('data-nid');
    location.href = "/Home/Contents?novelId=" + novelId;
});

function addMarker() {
    mui("#menulist").popover('toggle');
    $.post('/Home/AddMarkerJson?NovelId=' + novelId + '&novelTitleNo=' + sectionNum);
    mui.toast("收藏成功");
    $('#wshoucang-icon-btn').hide();
    $('#yshoucang-icon-btn').show();
}

function showChangeSize() {
    mui("#menulist").popover('toggle');
    layer.open({
        content: '<div id="sizeSelect"><span data-size="17px" class="select-col">小</span>' +
            '<span data-size="20px" data-font="#5E432E" class="select-col">中</span>' +
            '<span data-size="23px" data-font="#eeeeee" class="select-col">大</span></div>',
        btn: '好的',
        one: function (index) {
            layer.close(index);
        }
    });
}

function showChangeBg() {
    mui("#menulist").popover('toggle');
    layer.open({
        content: '<div id="bgSelect"><span data-bg="#faf9fd" data-font="#555555" data-section="#DE7C23" data-novel="#10AEFF" class="select-col">白天</span>' +
            '<span data-bg="#C1AF95" data-font="#5E432E" data-section="#5E432E" data-novel="#5E432E" class="select-col">舒适</span>' +
            '<span data-bg="#161617" data-font="#585858" data-section="#DE7C23" data-novel="#DE7C23" class="select-col">黑夜</span></div>',
        btn: '好的',
        one: function (index) {
            layer.close(index);
        }
    });
}

var fontSizeInt = 19;
$('body').on('click', '.my-sel-btn.a', function () {
    if (fontSizeInt <= 11) {
        return;
    }
    fontSizeInt -= 2;
    changeSize(fontSizeInt + 'px');
});
$('body').on('click', '.my-sel-btn.b', function () {
    if (fontSizeInt >= 25) {
        return;
    }
    fontSizeInt += 2;
    changeSize(fontSizeInt + 'px');
});
$('body').on('click', '#sizeSelect .select-col', function () {
    var size = this.getAttribute("data-size");
    changeSize(size);
});

function changeSize(size) {
    $(".essay-content p").css("font-size", size);
    $.post("/Home/ChangeFace", { FontSize: size }, function (d) { });
}

$('body').on('click', '.my-sel-btn', changeColor);
$('body').on('click', '#bgSelect .select-col', changeColor);

function changeColor() {
    var fontColor = this.getAttribute("data-font");
    if (!fontColor) return;
    $("body,#yunweidu-header-inside").css('background', this.getAttribute("data-bg"));
    $(".essay-content p").css("color", fontColor);
    $(".my-btn").css("color", fontColor);
    $(".my-btn").css("border-color", fontColor);

    $("#section-name").css('color', this.getAttribute("data-section"));
    //$("#novel-name").css('color', this.getAttribute("data-novel"));
    $(".essayinfo").css('color', fontColor);
    $.post("/Home/ChangeFace",
    {
        fontColor: fontColor,
        bgColor: this.getAttribute("data-bg"),
        sectionColor: this.getAttribute("data-section"),
        novelColor: this.getAttribute("data-novel")

    }, function (d) {

    });
}

function share() {
    $.ajax({
        url: '/Payment/Share',
        data: {
            url: encodeURI(url)
        },
        dataType: 'json', //服务器返回json格式数据
        type: 'post', //HTTP请求类型
        timeout: 10000, //超时时间设置为10秒；
        success: function (res) {
            if (res.code === 0) {
                wxConfig(res);
            }
        },
        error: function (xhr, type, errorThrown) {
            //alert('网络连接失败，请检查网络。');
        }
    });
}

// 微信配置
function wxConfig(res) {
    wx.config({
        debug: false,
        appId: res.data.appId,
        timestamp: res.data.timestamp,
        nonceStr: res.data.nonceStr,
        signature: res.data.signature,
        jsApiList: [
            'onMenuShareTimeline', // 分享朋友圈
            'onMenuShareAppMessage',
            'onMenuShareQQ',
            'onMenuShareWeibo',
            'onMenuShareQZone'
        ] // 分享好友
    });
    wx.ready(function () {
        // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
        // 分享到朋友圈
        wx.onMenuShareTimeline({
            title: novelName + '-' + novelDesc, // 分享标题
            link: res.msg, // 分享链接
            imgUrl: baseurl + novelImgUrl, // 分享图标
            success: function () {
                // 用户确认分享后执行的回调函数
                shareSuccess && shareSuccess();
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
            }
        });
        // 分享给朋友
        wx.onMenuShareAppMessage({
            title: novelName, // 分享标题
            desc: novelDesc, // 分享描述
            link: res.msg, // 分享链接
            imgUrl: baseurl + novelImgUrl, // 分享图标
            type: '', // 分享类型,music、video或link，不填默认为link
            dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
            success: function () {
                // 用户确认分享后执行的回调函数
                shareSuccess && shareSuccess();
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
            }
        });
        //分享到QQ
        wx.onMenuShareQQ({
            title: novelName, // 分享标题
            desc: novelDesc, // 分享描述
            link: res.msg, // 分享链接
            imgUrl: baseurl + novelImgUrl, // 分享图标
            success: function () {
                // 用户确认分享后执行的回调函数
                //shareSuccess && shareSuccess();
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
            }
        });
        //分享到微博
        wx.onMenuShareWeibo({
            title: novelName, // 分享标题
            desc: novelDesc, // 分享描述
            link: res.msg, // 分享链接
            imgUrl: baseurl + novelImgUrl, // 分享图标
            success: function () {
                // 用户确认分享后执行的回调函数
                //shareSuccess && shareSuccess();
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
            }
        });
        //分享到空间
        wx.onMenuShareQZone({
            title: novelName, // 分享标题
            desc: novelDesc, // 分享描述
            link: res.msg, // 分享链接
            imgUrl: baseurl + novelImgUrl, // 分享图标
            success: function () {
                //用户确认分享后执行的回调函数
                //shareSuccess && shareSuccess();
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
            }
        });
    });
    wx.error(function (res) {
    });
}

function shareSuccess() {
    if (shareCoin <= 0) {
        //分享送书币已关闭
        return;
    }
    $.post('/Home/ShareJson', "", function (data) {
        if (parseInt(data.code) == 0) {
            layer.open({
                content: '<h5 style="text-align:center;color:#333333; margin-bottom:10px;">分享成功</h5><span style="font-size:14px;color:#888888;">分享成功！恭喜获得 ' + shareCoin + ' 金币！</span>',
                btn: '好的',
                one: function (index) {
                    layer.close(index);
                }
            });
        } else {
            layer.open({
                content: '<h5 style="text-align:center;color:#333333; margin-bottom:10px;">分享失败</h5><span style="font-size:14px;color:#888888;">抱歉，今日分享已超过次数，无法获得金币奖励！</span>',
                btn: '好的',
                one: function (index) {
                    layer.close(index);
                }
            });
        }
    });
}
