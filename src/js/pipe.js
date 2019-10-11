(function (root, factory) {
	root['pipe'] = factory();
})(this, function () {
	var _is_preview = false;
	var _pagewidth = 750;
	var _ratio = 1;
	var _storage = null;
	var _topBannerHeight = 0; //实际的top-banner高度

	var _bottomBannerHeight = 0; //实际的bottom-banner高度

	var _topBannerShowHeight = 0; //当前页面显示的top-banner高度

	var _bottomBannerShowHeight = 0; //当前页面显示的bottom-banner高度

	var _showTopBannerFlag = false; //当前页是否显示top-banner

	var _showBottomBannerFlag = false; //当前页是否显示bottom-banner

	var shareKey = getQueryString('share');

	var _basePath = window.location.pathname

	function isArray(o) {
		return Object.prototype.toString.call(o) === '[object Array]';
	}

	function Storage(configuration) {
		this.__config = configuration;
		this.__listener = null;
		this.__monitor = null;

		this.all = function () {
			return this.__config || {};
		};

		this.get = function (key) {
			return this.__config[key];
		};

		this.check = function (key, externalButtons) {
			if ('buttons' === key) {
				var originButtons = this.get(key);

				if (isArray(externalButtons) && isArray(originButtons)) {
					// 遍历外部数据
					externalButtons.forEach(function (item) {
						var pickedBtn = originButtons.find(function (btn) {
							return item.image === btn.image;
						});

						if (pickedBtn) {
							item.position = pickedBtn.position;
						}
					});
				}
			}
		};

		this.save = function (key, value, origin) {
			if (origin === 'configer') {
				this.check(key, value);
			}

			this.__config[key] = value;

			if (this.__listener && origin === 'drager') {
				console.log('internal change', key, value);

				this.__listener(key, value);
			}

			if (this.__monitor && origin === 'configer') {
				console.log('external chang', key, value);

				this.__monitor(key, value);
			}
		}; // 配置平台监听


		this.listener = function (cb) {
			if (cb && typeof cb === 'function') {
				this.__listener = cb;
			}
		}; // 拖拽平台监听

		this.monitor = function (cb) {
			if (cb && typeof cb === 'function') {
				this.__monitor = cb;
			}
		};
	}

	function getQueryString(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
		var r = window.location.search.substr(1).match(reg);
		if (r != null) return unescape(r[2]);
		return null;
	}

	function addScript(path, cb) {
		// refrence to https://www.bennadel.com/blog/3454-jquery-s-append-methods-intercept-script-tag-insertion-and-circumvent-load-handlers.htm
		var isExist = false;
		var scripts = $('script');
		for (var i = 0; i < scripts.length; i++) {
			var src = $(scripts[i]).attr('src');
			if (src == path) {
				isExist = true;
				break;
			}
		}
		if (!isExist) {
			var scriptElement = document.createElement("script");
			scriptElement.onload = function () {
				cb();
			};
			scriptElement.setAttribute("type", "text/javascript");
			scriptElement.src = path;
			document.body.appendChild(scriptElement);
		} else {
			cb();
		}
	}

	function addCss(path, cb) {
		var isExist = false;
		var links = $('link');
		for (var i = 0; i < links.length; i++) {
			var src = $(links[i]).attr('href');
			if (src == path) {
				isExist = true;
				break;
			}
		}
		if (!isExist) {
			var scriptElement = document.createElement("link");
			scriptElement.onload = function () {
				cb();
			};
			scriptElement.setAttribute("rel", "stylesheet");
			scriptElement.href = path;
			document.head.appendChild(scriptElement);
		} else {
			cb();
		}
	}

	function getPassportHtml(nodeEl) {
		// 缺省设置颜色
		if (!nodeEl.theme) {
			nodeEl.theme = 'theme1';
		}

		function renderPassport() {
			var passportHtml = "\n\t\t\t\t<div id=\"passport-mobile-code-container\" style=\"width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;\">\n\t\t\t\t\t<div style=\"position: absolute; padding: " + 10 * _ratio + "px " + 20 * _ratio + "px " + 20 * _ratio + "px " + _ratio * 20 + "px;\">\n\t\t\t\t\t\t<div style=\"margin: " + 30 * _ratio + "px 0px;\">\n\t\t\t\t\t\t\t<input id=\"mobile-number-id\" type=\"text\" placeholder=\"\u8BF7\u8F93\u5165\u624B\u673A\u53F7\u7801\"\n\t\t\t\t\t\t\t\tstyle=\"padding: " + 10 * _ratio + "px " + 5 * _ratio + "px; font-size: " + 30 * _ratio + "px;\" />\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div id=\"captcha-picture\" style=\"display:block; margin-bottom: " + 30 * _ratio + "px\" class =\"code-item\">\n\t\t\t\t\t\t\t<input id=\"captch-code-id\" type=\"text\" placeholder=\"\u8BF7\u8F93\u5165\u56FE\u7247\u9A8C\u8BC1\u7801\" style=\"padding: " + 10 * _ratio + "px " + 5 * _ratio + "px; font-size: " + _ratio * 30 + "px;\"/>\n\t\t\t\t\t\t\t<img id=\"captcha-img\" class =\"code-btn\" />\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"code-item\" style=\"margin: " + 30 * _ratio + "px 0px;\">\n\t\t\t\t\t\t\t<input id=\"mobile-verifycode-id\" type=\"password\" placeholder=\"\u8BF7\u8F93\u5165\u9A8C\u8BC1\u7801\"\n\t\t\t\t\t\t\t\tstyle=\"padding: " + 10 * _ratio + "px " + 5 * _ratio + "px; font-size: " + _ratio * 30 + "px;\">\n\t\t\t\t\t\t\t<button class=\"code-btn\" id=\"btn-verifycode-id\"\n\t\t\t\t\t\t\t\tstyle=\"font-size: " + _ratio * 28 + "px; padding: 0 " + _ratio * 10 + "px;\">\u53D1\u9001\u9A8C\u8BC1\u7801</button>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"notice\" style=\"font-size: " + _ratio * 28 + "px; margin: " + _ratio * 35 + "px auto " + _ratio * 40 + "px auto;\">\n\t\t\t\t\t\t\t\u672A\u6CE8\u518C\u7684\u624B\u673A\u53F7\u7801\u9A8C\u8BC1\u540E\u5C06\u81EA\u52A8\u521B\u5EFA\u4E1C\u65B9\u8D22\u5BCC\u8D26\u53F7</div>\n\t\t\t\t\t\t<div id=\"passport-login-container\" style=\"text-align: center; height: " + _ratio * 80 + "px;\">\n\t\t\t\t\t\t\t<img style=\"height: 100%;\" src=\"" + nodeEl.buttonImage + "\" alt=\"\">\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t";
			return $($.parseHTML(passportHtml));
		}

		var container = $('<div>', {
			id: 'passport-container',
			'data-index': nodeEl.__name,
			"class": 'passport-' + nodeEl.theme
		}).css({
			width: '100%',
			minHeight: '240px',
			height: '240px'
		});
		var imgProps = {
			src: nodeEl.backgroundImage,
			width: '100%'
		};
		var backgroundImage = $('<img>', imgProps).css({
			position: 'absolute'
		});
		backgroundImage[0].addEventListener('load', function () {
			//const container = $('#passport-mobile-code-container');
			//if (container && container.length) {
			//    container.remove();
			//}
			var backgroundImageHeight = backgroundImage.height(); //const passport = renderPassport(backgroundImageHeight);
			//passport.appendTo($('#passport-container').css({ height: backgroundImageHeight }));

			$('#passport-container').css({
				height: backgroundImageHeight
			});
		}, false);
		backgroundImage.appendTo(container);
		var innerContainer = $('#passport-mobile-code-container');

		if (innerContainer && innerContainer.length) {
			innerContainer.remove();
		}

		var passport = renderPassport();
		passport.appendTo(container);
		return container;
	}

	function createEl(el) {
		if (el && el.type === 'rule' && el.active) {
			var css = {
				top: el.position.top * _ratio + 'px',
				left: el.position.left * _ratio + 'px',
				position: 'absolute',
				zIndex: 10,
				fontSize: 0,
				cursor: 'pointer'
			};
			var bannerMargin = 0;

			if (_is_preview && ['top', 'bottom'].indexOf(el.anchor) > -1) {
				css.zIndex = 25;
				css.position = 'fixed';

				if (el.anchor === 'top') {
					var top = adjustBtnsPosition(el, 'top');
					css.top = top + 'px';
				} else if (el.anchor === 'bottom') {
					var bottom = adjustBtnsPosition(el, 'top');
					css.bottom = bottom + 'px';
				}
			} else {
				var _top = adjustBtnsPosition(el, 'top');

				css.top = _top + 'px';
				css.position = 'absolute';
			}

			var imgProps = {
				src: el.image
			};
			var img = $('<img>', imgProps);
			img[0].addEventListener('load', function () {
				img.css({
					width: img.width() * _ratio
				});
			}, false);
			var a = $('<a>', {
				id: 'the-rule-entry',
				'el-type': 'el-rule'
			}).css(css);
			img.appendTo(a);
			return a;
		} else if (el && el.type && (el.type === 'content' || el.type === 'passport')) {
			if (el.type === 'content') {
				var props = {
					src: el.image
				};

				if (!_is_preview) {
					props['data-index'] = el.__name;
				}

				var _img = $('<img>', props).css({
					width: '100%',
					cursor: 'grabbing',
					display: 'block'
				});

				return _img;
			} else if (el.type === 'passport') {
				var passportHtml = getPassportHtml(el);
				return passportHtml;
			}
		} else if (el && el.type && el.type === 'button') {
			if (!el.image) {
				return;
			}

			var _css = {
				cursor: 'pointer',
				position: 'absolute',
				fontSize: 0,
				zIndex: 11
			};
			var bannerMargin = 0;
			var _props = {};

			if (el.anchor === 'top') {
				var _top2 = adjustBtnsPosition(el, 'top');

				_css.position = 'fixed';
				_css.zIndex = 25;
				_css.top = _top2 + 'px';
				_css.left = el.position.left * _ratio + 'px';
			} else if (el.anchor === 'bottom') {
				_css.position = 'fixed';
				_css.zIndex = 25;

				var _bottom = adjustBtnsPosition(el, 'bottom');

				_css.bottom = _bottom + 'px';
				_css.left = el.position.left * _ratio + 'px';
			} else {
				var _top3 = adjustBtnsPosition(el, 'top');

				_css.zIndex = 15;
				_css.top = _top3 + 'px';
				_css.left = el.position.left * _ratio + 'px';
			}

			_props.id = el.__name;

			var _a = $('<a>', _props).css(_css);

			var buttonProps = {
				src: el.image
			};
			var button = $('<img>', buttonProps);
			button[0].addEventListener('load', function () {
				button.css({
					width: button.width() * _ratio
				}); // 微信环境下，分享的按钮需要隐藏

				if (EMK.appInfo.isWeChat) {
					if (el.action === 'share') {
						_a.css({
							display: 'none'
						});
					}
				}

				if (el.action === 'scroll-top') {
					_a.css({
						display: 'none'
					});
				}
			}, false);
			button.appendTo(_a);
			return _a;
		} else if (el && el.type && el.type === 'top-banner') {
			//渲染前会清空banner，
			if (shareKey === '1') {
				//当是分享状态,renderBanner
				var elelTopBanner = renderBanner(el, 'top');
				return elelTopBanner;
			} else {
				//非分享地址
				if (el.showMoment === 'default' || !_is_preview) {
					//默认显示和预览状态会渲染图片renderBanner
					var _elelTopBanner = renderBanner(el, 'top');

					return _elelTopBanner;
				}
			}
		} else if (el && el.type && el.type === 'bottom-banner') {
			if (shareKey === '1') {
				//当是分享状态,renderBanner
				var eleBottomBanner = renderBanner(el, 'bottom');
				return eleBottomBanner;
			} else {
				if (el.showMoment === 'default' || !_is_preview) {
					//当未默认显示和预览状态renderBanner
					var _eleBottomBanner = renderBanner(el, 'bottom');

					return _eleBottomBanner;
				}
			}
		}
	}

	function adjustBtnsPosition(el, position) {
		var bannerMargin;
		var height;

		if (position == 'top') {
			if (_showTopBannerFlag === true) {
				bannerMargin = _bottomBannerShowHeight;
			} else {
				bannerMargin = _topBannerHeight;
			}

			height = el.position.top * _ratio - bannerMargin;

			if (_showTopBannerFlag === true) {
				//如果当前显示banner，将top值与banner的top进行比较
				if (height < _topBannerHeight) height = _topBannerHeight;
			} else {
				//如果未显示banner，将top值与0进行比较
				if (height <= 0) height = 0;
			}
		}

		if (position == 'bottom') {
			if (_showBottomBannerFlag === true) {
				bannerMargin = _bottomBannerShowHeight;
			} else {
				bannerMargin = _bottomBannerHeight;
			}

			height = el.position.bottom * _ratio - bannerMargin;

			if (_showBottomBannerFlag === true) {
				//如果当前显示banner，将bottom值与banner的bottom进行比较
				if (height <= _bottomBannerHeight) height = _bottomBannerHeight;
			} else {
				//如果未显示banner，将bottom值与0进行比较
				if (height <= 0) height = 0;
			}
		}

		return height;
	}

	function getBannerMaxHeight(position, actualHeight) {
		// var height = 0;
		var banners;

		if (position == 'top' && _storage && _storage.all() && _storage.get('topBanner') && _storage.get('topBanner').length) {
			banners = _storage.get('topBanner');
			_topBannerHeight = getBannerHeight(banners, actualHeight);
			_topShowBannerHeight = getBannerHeight(banners);
			var showBanner = banners.find(function (ele) {
				return ele.showMoment == 'default';
			});

			if (shareKey == '1' || showBanner) {
				_showTopBannerFlag = true;
			}
		} else if (position == 'bottom' && _storage && _storage.all() && _storage.get('bottomBanner') && _storage.get('bottomBanner').length) {
			banners = _storage.get('bottomBanner');
			_bottomBannerHeight = getBannerHeight(banners, actualHeight);
			_bottomShowBannerHeight = getBannerHeight(banners);

			var _showBanner = banners.find(function (ele) {
				return ele.showMoment == 'default';
			});

			if (shareKey == '1' || _showBanner) {
				_showBottomBannerFlag = true;
			}
		} //return height
	}

	function renderBanner(el, type) {
		var css = {};

		if (el.action) {
			css.cursor = 'pointer';
		}

		var img = $('<img>', {
			src: el.image,
			"class": 'swiper-slide',
			id: el.__name
		}).css(css); //img[0].src = el.image;
		//img[0].addEventListener('load', function () {
		//    if (type == "top") {
		//        topBannerViewCorrect();
		//    } else {
		//        bottomBannerViewCorrect();
		//    }
		//}, false);

		return img;
	}
	// 由配置对象生成页面
	function renderNode(_key, obj) {
		if (_key === 'title') {
			document.title = obj;
		} else if (_key === 'rule') {
			var theRules = $('#the-rule');

			if (theRules && theRules.length) {
				theRules.empty();
			} else {
				$('<div>', {
					id: 'the-rule'
				}).appendTo('#the-current-page');
			}

			obj.type = 'rule';
			var el = createEl(obj);

			if (el) {
				el.appendTo('#the-rule');
			}
		} else if (_key === 'contents') {
			var theContents = $('#the-contents');

			if (theContents && theContents.length) {
				theContents.empty();
			} else {
				$('<div>', {
					id: 'the-contents'
				}).appendTo('#the-current-page');
			}

			for (var k in obj) {
				var node = obj[k];
				node.__name = k;

				var _el = createEl(node);

				delete node.__name;

				if (_el) {
					_el.appendTo('#the-contents');
				}
			}
		} else if (_key === 'buttons') {
			var theButtons = $('#the-buttons');

			if (theButtons && theButtons.length) {
				theButtons.empty();
			} else {
				$('<div>', {
					id: 'the-buttons'
				}).appendTo('#the-current-page');
			}

			for (var _k in obj) {
				var _node = obj[_k];
				_node.__name = 'btn__' + _k;

				var _el2 = createEl(_node);

				delete _node.__name;

				if (_el2) {
					_el2.appendTo('#the-buttons');
				}
			}
		} else if (_key === 'topBanner') {
			$('#the-top-banners').remove();

			if (obj && obj.length) {
				var num = 0;
				var bannerHeight = _topShowBannerHeight;
				$('#the-contents').css({
					'margin-top': bannerHeight + 'px'
				});
				var css = {
					top: 0,
					left: 0,
					zIndex: 50,
					height: bannerHeight + 'px',
					width: _pagewidth + 'px'
				};

				if (_is_preview) {
					css.position = 'fixed';
				} else {
					css.position = 'absolute';
				}

				$('<div>', {
					id: 'the-top-banners',
					"class": 'swiper-container'
				}).css(css).appendTo('#the-current-page');
				$('<div>', {
					id: 'the-top-banner-wrapper',
					"class": 'swiper-wrapper'
				}).appendTo('#the-top-banners');

				for (var _k2 in obj) {
					var target = obj[_k2];
					target.type = 'top-banner';
					target.__name = 'topBanner-' + _k2;

					var _el3 = createEl(target);

					delete target.__name;

					if (_el3) {
						_el3.appendTo('#the-top-banner-wrapper');
					}
				}
			} else {//如果banner被清除,图片内容有margin-top的值，并且有多个按钮定位，重新对按钮进行top值定位
				// reduceBtnPositionTop('top')
			}
		} else if (_key === 'bottomBanner') {
			$('#the-bottom-banners').remove();

			if (obj && obj.length) {
				var bannerHeight = _bottomShowBannerHeight;
				$('#the-contents').css({
					'margin-bottom': bannerHeight + 'px'
				});
				var _css2 = {
					bottom: 0,
					left: 0,
					zIndex: 50,
					height: bannerHeight + 'px',
					width: _pagewidth + 'px'
				};

				if (_is_preview) {
					_css2.position = 'fixed';
				} else {
					_css2.position = 'absolute';
				}

				$('<div>', {
					id: 'the-bottom-banners',
					"class": 'swiper-container'
				}).css(_css2).appendTo('#the-current-page');
				$('<div>', {
					id: 'the-bottom-banner-wrapper',
					"class": 'swiper-wrapper'
				}).appendTo('#the-bottom-banners');

				for (var i = 0; i < obj.length; i++) {
					var _target = obj[i];
					_target.type = 'bottom-banner';
					_target.__name = 'bottomBanner-' + i;

					var _el4 = createEl(_target);

					delete _target.__name;

					if (_el4) {
						_el4.appendTo('#the-bottom-banner-wrapper');
					}
				}
			}
		}
	}

	function getBannerHeight(obj, actualHeight) {
		//设置banner的高度
		var num = 0;
		var bannerHeight = 0;
		obj.forEach(function (ele) {
			if (ele.showMoment == 'share') {
				num += 1;
			}

			if (parseInt(ele.height) > bannerHeight) {
				bannerHeight = parseInt(ele.height) * _ratio;
			}
		});

		if (num == obj.length && shareKey != '1' && !actualHeight) {
			bannerHeight = 0;
		}

		return bannerHeight;
	}

	function addBtnPositionTop(type) {
		var contentsMarginDistance = 55; //if (type == 'top') {
		//    contentsMarginDistance =parseInt($('#the-contents').css('marginTop'))
		//} else {
		//    contentsMarginDistance = parseInt($('#the-contents').css('marginBottom'))
		//}

		console.log('add,before' + JSON.stringify(_storage.get('buttons'))); //如果banner被清除,图片内容有margin-top的值，并且有多个按钮定位，重新对按钮进行top值定位

		if (_storage && _storage.all() && _storage.get('buttons') && _storage.get('buttons').length && contentsMarginDistance > 0) {
			var btns = _storage.get('buttons');

			for (var i = 0; i < btns.length; i++) {
				var btn = btns[i];

				if (btn && btn.position && (btn.position.top || btn.position.bottom)) {
					if (btn.position.top >= 0) btn.position.top += contentsMarginDistance; //if (btn.position.bottom >= 0) {
					//    btn.position.bottom -= contentsMarginDistance
					//    if (btn.position.bottom < 0) btn.position.botto = 0;
					//}
				}
			}
		}

		console.log('add,after' + JSON.stringify(_storage.get('buttons')));
		renderNode('buttons', _storage.get('buttons'));
		buttonsDisplace();
	}

	function reduceBtnPositionTop(type) {
		var contentsMarginDistance;

		if (type == 'top') {
			contentsMarginDistance = parseInt($('#the-contents').css('marginTop'));
		} else {
			contentsMarginDistance = parseInt($('#the-contents').css('marginBottom'));
		}

		console.log('before' + JSON.stringify(_storage.get('buttons'))); //如果banner被清除,图片内容有margin-top的值，并且有多个按钮定位，重新对按钮进行top值定位

		if (_storage && _storage.all() && _storage.get('buttons') && _storage.get('buttons').length && contentsMarginDistance > 0) {
			var btns = _storage.get('buttons');

			for (var i = 0; i < btns.length; i++) {
				var btn = btns[i];

				if (btn && btn.position && (btn.position.top || btn.position.bottom)) {
					if (btn.position.top >= 0) {
						btn.position.top -= contentsMarginDistance;
						if (btn.position.top < 0) btn.position.top = 0;
					} //if (btn.position.bottom>=0) {
					//    btn.position.bottom += contentsMarginDistance
					//}

				}
			}
		}

		console.log('after' + JSON.stringify(_storage.get('buttons')));
		renderNode('buttons', _storage.get('buttons'));
		buttonsDisplace();
	}

	function setViewPort() {
		var viewport = document.querySelector("meta[name=viewport]");
		viewport.setAttribute('content', "width=" + (_pagewidth || 750) + ", initial-scale=1.0, user-scalable=0");
	}

	function setTopContainer() {
		$('#the-current-page').css({
			width: _pagewidth + 'px'
		});
	}

	function render(pagewidth) {
		var configuration = _storage.all(); // const cuPw = document.body.clientWidth;
		_pagewidth = pagewidth; // _pagewidth = cuPw;

		_ratio = _pagewidth / (configuration.pagewidth || 750); // 确定页面布局比率
		// _ratio = _pagewidth / cuPw;

		setViewPort();
		setTopContainer();
		getBannerMaxHeight('top', 'actualHeight');
		getBannerMaxHeight('bottom', 'actualHeight');

		for (var k in configuration) {
			renderNode(k, configuration[k]);
		}
	}
	// render(_config, false);

	function setupSwiper() {
		// 需要先判断是否topBanners是否存在，且数据大于1
		if (_storage && _storage.all() && _storage.get('topBanner') && _storage.get('topBanner').length) {
			var options = {
				autoplay: true
			};

			if (_storage.get('topBanner').length > 1) {
				options.loop = true;
			}

			new Swiper('#the-top-banners', options);
		} else {
			//如果没有topBanner,清除图片容器的margin-top
			$('#the-contents').css({
				'margin-top': 0
			});
		} // 需要先判断是否bottomBanners是否存在，且数据大于1


		if (_storage && _storage.all() && _storage.get('bottomBanner') && _storage.get('bottomBanner').length) {
			var _options = {
				autoplay: true
			};

			if (_storage.get('bottomBanner').length > 1) {
				_options.loop = true;
			}

			new Swiper('#the-bottom-banners', _options);
		} else {
			//如果没有bottomBanner,清除图片容器的margin-bottom
			$('#the-contents').css({
				'margin-bottom': 0
			});
		}
	}

	function buttonsDisplace() {
		var displace = window.displacejs;
		var displaceElements = [];

		if (_storage && _storage.all() && _storage.get('buttons') && _storage.get('buttons').length) {
			var btns = _storage.get('buttons');

			for (var i = 0; i < btns.length; i++) {
				var btn = btns[i];

				if (btn && btn.image) {
					displaceElements.push('.btn__' + i);
				}
			}
		}

		if (_storage && _storage.all() && _storage.get('rule') && _storage.get('rule')['active']) {
			displaceElements.push('#the-rule-entry');
		}

		displaceElements.map(function (cls) {
			var el = document.querySelector(cls);
			displace(el, {
				onMouseUp: function onMouseUp() {
					var elType = $(el).attr('el-type'); // 定位矫正

					if (el.offsetLeft < 0) {
						$(el).css({
							left: 0
						});
					} else if (el.offsetLeft + $(el).width() > _pagewidth) {
						$(el).css({
							left: _pagewidth - el.clientWidth
						});
					}

					if (el.offsetTop < 0) {
						$(el).css({
							top: 0
						});
					}

					if (elType === 'el-button' || elType === 'el-rule') {
						if (_storage.all() && _storage.get('topBanner') && _storage.get('topBanner').length) {
							var topHeight = $('#the-top-banners').height();

							if (el.offsetTop < topHeight) {
								$(el).css({
									top: topHeight
								});
							}
						}

						if (_storage.all() && _storage.get('bottomBanner') && _storage.get('bottomBanner')) {
							var bottomHeight = $('#the-bottom-banners').height();
							var contentHeight = $('#the-current-page').height();
							var maxOffsetTop = contentHeight - bottomHeight - el.clientHeight;

							if (el.offsetTop > maxOffsetTop) {
								$(el).css({
									top: maxOffsetTop
								});
							}
						}

						var clsList = el.className.split(' ');
						var findCls = clsList.find(function (item) {
							return item.indexOf('btn__') > -1;
						});

						if (findCls) {
							var tempList = findCls.split('__');
							var btnIndex = tempList[tempList.length - 1];

							var _btn = _storage.get('buttons')[btnIndex];

							setBtnDragPosition(el, _btn);
							pageEmit('buttons', _storage.get('buttons'));
						} //规则按钮控制


						var rule = _storage.get('rule');

						setBtnDragPosition(el, rule);
						pageEmit('rule', rule);
					}
				}
			});
		});
	}

	function setBtnDragPosition(el, btn) {
		if (btn.anchor === 'bottom') {
			var offsetBottom = $('#the-current-page').height() - $(el)[0].offsetTop - $(el).children('img').height();
			if (offsetBottom < 0) offsetBottom = 0;
			$(el).css({
				bottom: offsetBottom
			});
			btn.position = {
				bottom: offsetBottom / _ratio,
				left: el.offsetLeft / _ratio
			};
		} else if (btn.anchor === 'top') {
			if (el.offsetTop < 0) el.offsetTop = 0;
			$(el).css({
				top: el.offsetTop
			});
			btn.position = {
				top: el.offsetTop / _ratio,
				left: el.offsetLeft / _ratio
			};
		} else {
			btn.position = {
				top: el.offsetTop / _ratio,
				left: el.offsetLeft / _ratio
			};
		}
	}

	function contentsDisplace() {
		var dragulable = window.dragula;
		var drake = dragulable([document.querySelector('#the-contents')], {
			moves: function moves(el, source, handle, sibling) {
				return true; // elements are always draggable by default
			},
			accepts: function accepts(el, target, source, sibling) {
				return true; // elements can be dropped in any of the `containers` by default
			},
			release: function release(e) {
				// 监听鼠标谈起mouseup事件
				if (_storage.all() && _storage.get('contents') && _storage.get('contents').length) {
					var newContents = [];
					var contents = $('#the-contents').children();
					var isSame = true;

					var oldContents = _storage.get('contents');

					for (var i = 0; i < contents.length; i++) {
						var imgIndex = $(contents[i]).attr('data-index');
						$(contents[i]).attr('data-index', i);
						newContents.push(oldContents[imgIndex]);

						if (oldContents[i].image !== oldContents[imgIndex].image) {
							isSame = false;
						}
					} // 对比原有数据


					if (!isSame) {
						pageEmit('contents', newContents);
					}
				}
			}
		});
	}

	$(document).ready(function () {// setupSwiper();
	});

	function topBannerViewCorrect() {
		// 视图矫正
		// 1. 计算top banner和bottom banner的高度
		if (_storage && _storage.all() && _storage.get('topBanner') && _storage.get('topBanner').length) {
			var topHeight = $('#the-top-banners').height();
			$('#the-contents').css({
				'margin-top': topHeight
			});
		}
	}

	function bottomBannerViewCorrect() {
		// 1. 计算top banner和bottom banner的高度
		if (_storage && _storage.all() && _storage.get('bottomBanner') && _storage.get('bottomBanner')) {
			var bottomHeight = $('#the-bottom-banners').height();
			$('#the-contents').css({
				'margin-bottom': bottomHeight
			});
		}
	}
	// 拖拽平台修改通知到配置平台
	function pageEmit(key, obj) {
		// 利用json stringify进行深拷贝 - 场景是由于config对象来源于json字符串
		var copyObj = JSON.parse(JSON.stringify(obj));

		_storage.save(key, copyObj, 'drager');
	}


	// 初始化storage
	var factory = {};

	function init(config, isPreview) {
		_is_preview = isPreview; // 配置平台

		if (!_is_preview) {
			var loadNumber = 0;

			function isLoadSucess() {
				if (loadNumber == 5) {
					setupSwiper();
					contentsDisplace();
					buttonsDisplace(); // 监听配置平台的数据发生了改变，配置平台通过对storage对象的save(key, value)方法进行变更数据

					_storage.monitor(function (key, value) {
						renderNode(key, value);

						if (key === 'buttons' || key === 'rule') {
							buttonsDisplace();
						} else if (key === 'topBanner' || key === 'bottomBanner') {
							setupSwiper();
						}
					});
				}
			}

			addCss('../libs/swiper/swiper.css', function () {
				loadNumber += 1;
				isLoadSucess();
			});
			addScript('../libs/swiper/swiper.js', function () {
				loadNumber += 1;
				isLoadSucess();
			});
			addCss('../css/dragula.css', function () {
				loadNumber += 1;
				isLoadSucess();
			});
			addScript('./dragula.js', function () {
				loadNumber += 1;
				isLoadSucess();
			});
			addScript('./displace.js', function () {
				loadNumber += 1;
				isLoadSucess();
			});
		} else {
			var loadSwiperSuccess = 0;
			function isLoadSwiperSuccess() {
				if (loadSwiperSuccess == 2) {
					setupSwiper();
				}
			}

			addCss(_basePath + 'src/libs/swiper/swiper.css', function () {
				loadSwiperSuccess += 1;
				isLoadSwiperSuccess();
			});
			addScript(_basePath + 'src/libs/swiper/swiper.js', function () {
				loadSwiperSuccess += 1;
				isLoadSwiperSuccess();
			});
		}

		_storage = new Storage(config);
		factory['storage'] = _storage;
	}

	function toast(msg, cb) {
		var toastContainer = $('<div>', {
			id: 'toast-container-dc'
		}).css({
			position: 'fixed',
			top: 0,
			left: 0,
			width: _pagewidth,
			height: '100%',
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center'
		});
		var toast = $('<div>').css({
			backgroundColor: 'rgba(0, 0, 0, 0.8)',
			padding: 30 * _ratio + 'px',
			color: '#ffffff',
			marginLeft: 40 * _ratio + 'px',
			marginRight: 40 * _ratio + 'px',
			textAlign: 'center',
			lineHeight: '1.5',
			fontSize: 30 * _ratio + 'px',
			borderRadius: 5 * _ratio + 'px'
		}).text(msg);
		toast.appendTo(toastContainer);
		toastContainer.appendTo('#the-current-page');
		var timer = setTimeout(function () {
			$('#toast-container-dc').remove();

			if (cb && typeof cb === 'function') {
				cb();
			}

			clearTimeout(timer);
		}, 2000);
	}

	factory['renderDom'] = render;
	factory['init'] = init;
	factory['layer'] = {
		toast: toast
	};

	return factory;
});