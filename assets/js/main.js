/*
	Strata by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	var lambdaChargeGBSecond = 0.00001667;
	var lambdaRequestCharge = 0.20;
	var lambdaFreeTier = 400000;
	var lambdaFreeRequests = 1000000;

	var azureChargeGBSecond = 0.000008;
	var azureRequestCharge = 0.20;
	var azureFreeTier = 400000;
	var azureFreeRequests = 1000000;

	var ibmChargeGBSecond = 0.000017;
	var ibmRequestCharge = 0;
	var ibmFreeTier = 400000;
	var ibmFreeRequests = 0;

	var settings = {

		// Parallax background effect?
			parallax: true,

		// Parallax factor (lower = more intense, higher = less intense).
			parallaxFactor: 20

	};

	skel.breakpoints({
		xlarge: '(max-width: 1800px)',
		large: '(max-width: 1280px)',
		medium: '(max-width: 980px)',
		small: '(max-width: 736px)',
		xsmall: '(max-width: 480px)'
	});

	$(function() {

		var $window = $(window),
			$body = $('body'),
			$header = $('#header');

		// Disable animations/transitions until the page has loaded.
			$body.addClass('is-loading');

			$window.on('load', function() {
				$body.removeClass('is-loading');
			});

		// Touch?
			if (skel.vars.mobile) {

				// Turn on touch mode.
					$body.addClass('is-touch');

				// Height fix (mostly for iOS).
					window.setTimeout(function() {
						$window.scrollTop($window.scrollTop() + 1);
					}, 0);

			}

		// Fix: Placeholder polyfill.
			$('form').placeholder();

		// Prioritize "important" elements on medium.
			skel.on('+medium -medium', function() {
				$.prioritize(
					'.important\\28 medium\\29',
					skel.breakpoint('medium').active
				);
			});

		// Header.

			// Parallax background.

				// Disable parallax on IE (smooth scrolling is jerky), and on mobile platforms (= better performance).
					if (skel.vars.browser == 'ie'
					||	skel.vars.mobile)
						settings.parallax = false;

				if (settings.parallax) {

					skel.on('change', function() {

						if (skel.breakpoint('medium').active) {

							$window.off('scroll.strata_parallax');
							$header.css('background-position', 'top left, center center');

						}
						else {

							$header.css('background-position', 'left 0px');

							$window.on('scroll.strata_parallax', function() {
								$header.css('background-position', 'left ' + (-1 * (parseInt($window.scrollTop()) / settings.parallaxFactor)) + 'px');
							});

						}

					});

				}

		// Main Sections: Two.

			// Lightbox gallery.
				$window.on('load', function() {

					$('#two').poptrox({
						caption: function($a) { return $a.next('h3').text(); },
						overlayColor: '#2c2c2c',
						overlayOpacity: 0.85,
						popupCloserText: '',
						popupLoaderText: '',
						selector: '.work-item a.image',
						usePopupCaption: true,
						usePopupDefaultStyling: false,
						usePopupEasyClose: false,
						usePopupNav: true,
						windowMargin: (skel.breakpoint('small').active ? 0 : 50)
					});

				});

				function calculateCost(chargeGBSecond, requestCharge, freeTierLength, freeRequests) {
					var result = {};

					var numberOfExecutions = $('#number-executions').val();
					var executedEstimationTime = $('#executed-estimation-time').val();
					var memory = $('#memory').val();
					var includeFreeTier = $('input[type=radio][name=freetier]:checked').val();

					if (parseInt(numberOfExecutions) && parseInt(executedEstimationTime) && parseInt(memory)) {
						//round up to nearest 100ms
						var executedEstimationTime = Math.ceil(executedEstimationTime / 100.0) * 100;

						//calculate monthly compute charge
						var totalComputeInSeconds = numberOfExecutions * (executedEstimationTime / 1000);
						var totalComputeGBSeconds = totalComputeInSeconds * (memory/1024);
						var billableCompute = totalComputeGBSeconds;

						if (JSON.parse(includeFreeTier) === true) {
							billableCompute = Math.max(totalComputeGBSeconds - freeTierLength, 0);
						}

						//workout Lambda
						billableCompute = billableCompute * chargeGBSecond;

						result.executionCost = parseFloat(billableCompute).toFixed(2);

						//calculate monthly request charge
						var billableRequests = numberOfExecutions;

						if (JSON.parse(includeFreeTier) === true) {
							billableRequests = Math.max(billableRequests - freeRequests, 0);
						}

						billableRequests = billableRequests * (requestCharge/1000000);

						result.requestCost =  parseFloat(billableRequests).toFixed(2);
						result.totalCost = parseFloat(billableCompute + billableRequests).toFixed(2);
					}

					return result;
				}

			function Update() {
				var result = calculateCost(lambdaChargeGBSecond, lambdaRequestCharge, lambdaFreeTier, lambdaFreeRequests);

				if (result.executionCost && result.requestCost && result.totalCost) {
					$('#lambda-execution-cost').text(parseFloat(result.executionCost).toFixed(2));
					$('#lambda-request-cost').text(parseFloat(result.requestCost).toFixed(2));
					$('#lambda-total-cost').text(parseFloat(result.totalCost).toFixed(2));
				}

				result = calculateCost(azureChargeGBSecond, azureRequestCharge, azureFreeTier, azureFreeRequests);

				if (result.executionCost && result.requestCost && result.totalCost) {
					$('#azure-execution-cost').text(parseFloat(result.executionCost).toFixed(2));
					$('#azure-request-cost').text(parseFloat(result.requestCost).toFixed(2));
					$('#azure-total-cost').text(parseFloat(result.totalCost).toFixed(2));
				}

				result = calculateCost(ibmChargeGBSecond, ibmRequestCharge, ibmFreeTier, ibmFreeRequests);

				if (result.executionCost && result.requestCost && result.totalCost) {
					$('#ibm-execution-cost').text(parseFloat(result.executionCost).toFixed(2));
					$('#ibm-request-cost').text(parseFloat(result.requestCost).toFixed(2));
					$('#ibm-total-cost').text(parseFloat(result.totalCost).toFixed(2));
				}

			}

			$('#number-executions').on('input propertychange paste', function(result, value) {
				Update();
			});

			$('#executed-estimation-time').on('input propertychange paste', function(result, value) {
				Update();
			});

			$('#memory').on('change', function(result, value) {
				Update();
			});

			$('input[type=radio][name=freetier]').on('change', function(result, value) {
				Update();
			});
	});

})(jQuery);
