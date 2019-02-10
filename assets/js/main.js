(function($) {

	var	$window = $(window),
		$body = $('body'),
		$wrapper = $('#wrapper'),
		$header = $('#header'),
		$banner = $('#banner');

	// Breakpoints.
		breakpoints({
			xlarge:    ['1281px',   '1680px'   ],
			large:     ['981px',    '1280px'   ],
			medium:    ['737px',    '980px'    ],
			small:     ['481px',    '736px'    ],
			xsmall:    ['361px',    '480px'    ],
			xxsmall:   [null,       '360px'    ]
		});

	/**
	 * Applies parallax scrolling to an element's background image.
	 * @return {jQuery} jQuery object.
	 */
	$.fn._parallax = (browser.name == 'ie' || browser.name == 'edge' || browser.mobile) ? function() { return $(this) } : function(intensity) {

		var	$window = $(window),
			$this = $(this);

		if (this.length == 0 || intensity === 0)
			return $this;

		if (this.length > 1) {

			for (var i=0; i < this.length; i++)
				$(this[i])._parallax(intensity);

			return $this;

		}

		if (!intensity)
			intensity = 0.25;

		$this.each(function() {

			var $t = $(this),
				on, off;

			on = function() {

				$t.css('background-position', 'center 100%, center 100%, center 0px');

				$window
					.on('scroll._parallax', function() {

						var pos = parseInt($window.scrollTop()) - parseInt($t.position().top);

						$t.css('background-position', 'center ' + (pos * (-1 * intensity)) + 'px');

					});

			};

			off = function() {

				$t
					.css('background-position', '');

				$window
					.off('scroll._parallax');

			};

			breakpoints.on('<=medium', off);
			breakpoints.on('>medium', on);

		});

		$window
			.off('load._parallax resize._parallax')
			.on('load._parallax resize._parallax', function() {
				$window.trigger('scroll');
			});

		return $(this);

	};

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Clear transitioning state on unload/hide.
		$window.on('unload pagehide', function() {
			window.setTimeout(function() {
				$('.is-transitioning').removeClass('is-transitioning');
			}, 250);
		});

	// Fix: Enable IE-only tweaks.
		if (browser.name == 'ie' || browser.name == 'edge')
			$body.addClass('is-ie');

	// Scrolly.
		$('.scrolly').scrolly({
			offset: function() {
				return $header.height() - 2;
			}
		});

	// Tiles.
		var $tiles = $('.tiles > article');

		$tiles.each(function() {

			var $this = $(this),
				$image = $this.find('.image'), $img = $image.find('img'),
				$link = $this.find('.link'),
				x;

			// Image.

				// Set image.
					$this.css('background-image', 'url(' + $img.attr('src') + ')');

				// Set position.
					if (x = $img.data('position'))
						$image.css('background-position', x);

				// Hide original.
					$image.hide();

			// Link.
				if ($link.length > 0) {

					$x = $link.clone()
						.text('')
						.addClass('primary')
						.appendTo($this);

					$link = $link.add($x);

					$link.on('click', function(event) {

						var href = $link.attr('href');

						// Prevent default.
							event.stopPropagation();
							event.preventDefault();

						// Target blank?
							if ($link.attr('target') == '_blank') {

								// Open in new tab.
									window.open(href);

							}

						// Otherwise ...
							else {

								// Start transitioning.
									$this.addClass('is-transitioning');
									$wrapper.addClass('is-transitioning');

								// Redirect.
									window.setTimeout(function() {
										location.href = href;
									}, 500);

							}

					});

				}

		});

	// Header.
		if ($banner.length > 0
		&&	$header.hasClass('alt')) {

			$window.on('resize', function() {
				$window.trigger('scroll');
			});

			$window.on('load', function() {

				$banner.scrollex({
					bottom:		$header.height() + 10,
					terminate:	function() { $header.removeClass('alt'); },
					enter:		function() { $header.addClass('alt'); },
					leave:		function() { $header.removeClass('alt'); $header.addClass('reveal'); }
				});

				window.setTimeout(function() {
					$window.triggerHandler('scroll');
				}, 100);

			});

		}

	// Banner.
		$banner.each(function() {

			var $this = $(this),
				$image = $this.find('.image'), $img = $image.find('img');

			// Parallax.
				$this._parallax(0.275);

			// Image.
				if ($image.length > 0) {

					// Set image.
						$this.css('background-image', 'url(' + $img.attr('src') + ')');

					// Hide original.
						$image.hide();

				}

		});

	// Menu.
		var $menu = $('#menu'),
			$menuInner;

		$menu.wrapInner('<div class="inner"></div>');
		$menuInner = $menu.children('.inner');
		$menu._locked = false;

		$menu._lock = function() {

			if ($menu._locked)
				return false;

			$menu._locked = true;

			window.setTimeout(function() {
				$menu._locked = false;
			}, 350);

			return true;

		};

		$menu._show = function() {

			if ($menu._lock())
				$body.addClass('is-menu-visible');

		};

		$menu._hide = function() {

			if ($menu._lock())
				$body.removeClass('is-menu-visible');

		};

		$menu._toggle = function() {

			if ($menu._lock())
				$body.toggleClass('is-menu-visible');

		};

		$menuInner
			.on('click', function(event) {
				event.stopPropagation();
			})
			.on('click', 'a', function(event) {

				var href = $(this).attr('href');

				event.preventDefault();
				event.stopPropagation();

				// Hide.
					$menu._hide();

				// Redirect.
					window.setTimeout(function() {
						window.location.href = href;
					}, 250);

			});

		$menu
			.appendTo($body)
			.on('click', function(event) {

				event.stopPropagation();
				event.preventDefault();

				$body.removeClass('is-menu-visible');

			})
			.append('<a class="close" href="#menu">Close</a>');

		$body
			.on('click', 'a[href="#menu"]', function(event) {

				event.stopPropagation();
				event.preventDefault();

				// Toggle.
					$menu._toggle();

			})
			.on('click', function(event) {

				// Hide.
					$menu._hide();

			})
			.on('keydown', function(event) {

				// Hide on escape.
					if (event.keyCode == 27)
						$menu._hide();

			});

})(jQuery);

const canvas = document.getElementById('stars');
const context = canvas.getContext('2d');
const bcanvas = document.createElement('canvas');
const bcontext = bcanvas.getContext('2d');
bcanvas.height = canvas.height = canvas.parentNode.offsetHeight;
bcanvas.width = canvas.width = canvas.parentNode.offsetWidth;

// shitty debounce
window.addEventListener('resize', (event => {
	const bounce = 100;
	let start = Date.now()
	return event => {
		if( Date.now() - start > bounce ) {
			bcanvas.height = canvas.height = canvas.parentNode.offsetHeight;
			bcanvas.width = canvas.width = canvas.parentNode.offsetWidth;
			start = Date.now()
		}
	}
})())

let maxSize = 5;
let minSize = 3;
const starmap = Array.from(Array(128), initializr);
maxSize /= 2;
minSize /= 2;

drawBackground();
canvas.style.backgroundImage = `url(${bcanvas.toDataURL()})`;
animate();

function initializr() {
	const seed = Math.random() > 0.1 ?
									Math.floor(Math.random()*15000+3000) :
									Math.floor(Math.random()*3000 + 500) ; // too many red dwarfs look weird. 
									
	const {red, green, blue} = colorTemperature2rgb(seed);
	const properties = { 
		x: Math.random()*canvas.width,
		y: Math.random()*canvas.height,
		size: Math.random()*(maxSize-minSize)+minSize
	};
	properties.color = `rgba(${red},${green},${blue},${properties.size/maxSize})`;
	properties.twinkle = Math.random()* + 1;
	return properties;
}

function drawBackground() {
	const backgroundmap = Array.from(Array(2000), initializr);
	for( const star of backgroundmap ) {
		bcontext.beginPath();
		bcontext.fillStyle = star.color;
		bcontext.shadowColor = star.color;
		bcontext.shadowBlur = star.twinkle * 10;

		bcontext.arc(star.x, star.y, star.size/2, 0, Math.PI*2);
		bcontext.fill();
		bcontext.closePath();
	}
}

function animate() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	for( const star of starmap ) {
		star.twinkle += (Math.random()*2-1) / 2;
		star.twinkle = Math.max(1, Math.min(8, star.twinkle));
		
		// so the whole idea was to see if it was faster to draw two squares than 
		// one circle. it isn't. kinda looks neat though.
		
		// this gets me 60fps
		context.beginPath();
		context.fillStyle = star.color;
		context.shadowColor = star.color;
		context.shadowBlur = star.twinkle * 10;

		context.arc(star.x, star.y, star.size/2, 0, Math.PI*2);
		context.fill();
		context.closePath();

		// this gets me like 40fps.
		// context.save();
		// context.beginPath();
		// context.translate(star.x - star.size/2, star.y - star.size/2);
		// context.fillStyle = star.color;
		// context.shadowColor = star.color;
		// context.shadowBlur = star.twinkle * 10;
		// context.fillRect(0, 0, star.size, star.size);
		// context.translate(star.size/2, -star.size/4);
		// context.rotate(45 * Math.PI / 180);
		// context.fillRect(0, 0, star.size, star.size);
		// context.closePath();
		// context.restore();
	}
	requestAnimationFrame(animate);
}

// I was too lazy to figure out this on my own. 
// shamelessly stolen from here: 
// https://github.com/neilbartlett/color-temperature/blob/master/index.js
function colorTemperature2rgb (kelvin) {

	var temperature = kelvin / 100.0;
	var red, green, blue;

	if (temperature < 66.0) {
		red = 255;
	} else {
		// a + b x + c Log[x] /.
		// {a -> 351.97690566805693`,
		// b -> 0.114206453784165`,
		// c -> -40.25366309332127
		//x -> (kelvin/100) - 55}
		red = temperature - 55.0;
		red = 351.97690566805693+ 0.114206453784165 * red - 40.25366309332127 * Math.log(red);
		if (red < 0) red = 0;
		if (red > 255) red = 255;
	}

	/* Calculate green */

	if (temperature < 66.0) {

		// a + b x + c Log[x] /.
		// {a -> -155.25485562709179`,
		// b -> -0.44596950469579133`,
		// c -> 104.49216199393888`,
		// x -> (kelvin/100) - 2}
		green = temperature - 2;
		green = -155.25485562709179 - 0.44596950469579133 * green + 104.49216199393888 * Math.log(green);
		if (green < 0) green = 0;
		if (green > 255) green = 255;

	} else {

		// a + b x + c Log[x] /.
		// {a -> 325.4494125711974`,
		// b -> 0.07943456536662342`,
		// c -> -28.0852963507957`,
		// x -> (kelvin/100) - 50}
		green = temperature - 50.0;
		green = 325.4494125711974 + 0.07943456536662342 * green - 28.0852963507957 * Math.log(green);
		if (green < 0) green = 0;
		if (green > 255) green = 255;

	}

	/* Calculate blue */

	if (temperature >= 66.0) {
		blue = 255;
	} else {

		if (temperature <= 20.0) {
			blue = 0;
		} else {

			// a + b x + c Log[x] /.
			// {a -> -254.76935184120902`,
			// b -> 0.8274096064007395`,
			// c -> 115.67994401066147`,
			// x -> kelvin/100 - 10}
			blue = temperature - 10;
			blue = -254.76935184120902 + 0.8274096064007395 * blue + 115.67994401066147 * Math.log(blue);
			if (blue < 0) blue = 0;
			if (blue > 255) blue = 255;
		}
	}

	return {red: Math.round(red), blue: Math.round(blue), green: Math.round(green)};
}
