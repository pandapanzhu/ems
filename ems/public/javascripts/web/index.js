	$(function(){
		
		init();
		function init() {
			/*关闭导航标签栏*/
			$(".guide>ul>li").find("span").off().click(function(){
				var $parent = $(this).parent();
				var closeUrl = $parent.attr("data-url");
				
				/*删除导航栏和iframe*/
				$parent.remove();
				$(".frame>iframe").each(function(){
					if ($(this).attr("src") == closeUrl) {
						$(this).remove();
					}
				});

				/*选择末尾item高亮，展示末尾iframe*/
				var $item = $(".guide>ul>li:last");
				$item.addClass("gactive");
				var openUrl = $item.attr("data-url"); 
				$(".frame>iframe:last").removeClass("hide");

			});

			/*点击导航标签栏高亮*/
			$(".guide>ul>li").off().click(function(){
				$(this).siblings().removeClass("gactive");
				$(this).addClass("gactive");
				/*切换iframe*/
				var openUrl = $(this).attr("data-url");
				/*hide之前展示的iframe，show展示的iframe*/
				$(".frame>iframe").addClass("hide").each(function(){
					if ($(this).attr("src") == openUrl) {
						$(this).removeClass("hide");
					}
				});
			});
		}

		/*点击菜单栏*/
		$(".list").find("a").click(function(){
			return false;
		});
		$(".yiji>li>ul>li").find("a").click(function(){
			var title = $(this).text();
			title = title.substring(1, title.length);
			var openUrl = $(this).attr("href");
//			console.log("title = " + title + " ; " + "url = " + openUrl);
			var exist = false;

			/*清除其他高亮*/
			$(".guide").find("li").removeClass("gactive");

			//判断导航栏中是否存在该url，若存在则高亮，改变iframe的url，若不存在则添加
			$(".guide>ul>li").each(function() {
//				console.log($(this).attr("data-url") + " : " + openUrl);
				if ($(this).attr("data-url") == openUrl) {
					$(this).addClass("gactive");
					exist = true;
//					console.log("this url is already exist ~~1");
				}
			});
			
			if (exist == true) {
//				console.log("this url is already exist ~~2");	
				/*切换iframe*/
				/*hide之前展示的iframe，show展示的iframe*/
				$(".frame>iframe").addClass("hide").each(function(){
					if ($(this).attr("src") == openUrl) {
						$(this).removeClass("hide");
						$(this).attr("src", openUrl);//点击更改url
					}
				});
			}else {
				var html = '<li data-url="' + openUrl + '" class="gactive">' + title + '<span class="glyphicon glyphicon-remove"></span></li>';
				$(".guide>ul").append(html);
				/*导航栏绑定事件*/
				init();
				/*拼接iframe*/
				html = '<iframe src="' + openUrl +'" frameborder="0" scrolling=true></iframe>';
				/*隐藏之前的iframe*/
				$(".frame>iframe").addClass("hide");
				$(".frame").append(html);
			}
			return false;
		});

		/*菜单*/
		$('.inactive').click(function(){
			if($(this).siblings('ul').css('display')=='none'){
				$(this).siblings('ul').slideDown(100);
				$(this).addClass('inactives');
				$(this).parents('li').siblings('li').children('ul').slideUp(100);
				$(this).parents('li').siblings('li').children('a').removeClass('inactives');
			}else{
				$(this).removeClass('inactives')
				$(this).siblings('ul').slideUp(100);
			}
		});
	});