// Restricts input for the set of matched elements to the given inputFilter function.
(function ($) {
	$.fn.inputFilter = function (inputFilter) {
		return this.on("input keydown keyup mousedown mouseup select contextmenu drop", function () {
			if (inputFilter(this.value)) {
				this.oldValue = this.value;
				this.oldSelectionStart = this.selectionStart;
				this.oldSelectionEnd = this.selectionEnd;
			} else if (this.hasOwnProperty("oldValue")) {
				this.value = this.oldValue;
				this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
			} else {
				this.value = "";
			}
		});
	};
}(jQuery));

$(document).ready(function () {
	$("input").inputFilter(function (value) {
		return /\d*\.?\d*/.test(value); //only digits & dots accepted
	});
	$('#cmp').val(localStorage.getItem("cmp"));
	$('#qty').val(localStorage.getItem("qty"));
	$('#avg').val(localStorage.getItem("avg"));

	DynamicInputWidthChange();
	$('body').on('click', 'li', function (e) {
		if (!$(e.currentTarget).hasClass('active')) {
			$('li,.selltype').toggleClass('active');
		}
	});
});
$(".goback").click(function () {
	$(".inputForm").show();
	$(".result,.nav,.goback").hide();
});
$("#submit").click(function (event) {
	let cmp = parseInt($('#cmp').val()) || 0;
	let qty = parseInt($('#qty').val()) || 0;
	let avg = parseInt($('#avg').val()) || 0;

	$('.inputForm input').each(function () {
		if(!parseInt($(this).val()))
		$(this).css('border-color', 'red');
		else
		$(this).css('border-color', 'black');
	});
	
	if (cmp == 0 || qty == 0 || avg == 0) {
		return false;
	}
    localStorage.setItem("cmp",cmp);
    localStorage.setItem("qty",qty);
    localStorage.setItem("avg",avg);
	
	$(".inputForm").hide();
	$(".goback,.result").show();
	$(".result:first").attr('style', 'display: flex !important;justify-content: center;margin-top: 10px;');
	$(".nav").attr('style', 'display: flex !important;');
	$(".result.text-center").attr('style', 'display: block !important;');
	$('#netgain').val(0);

	let totalinvestment = qty * avg;
	let profit = 0;
	let profit_per = 0;
	let currentValue = cmp * qty;

	profit = currentValue - (totalinvestment);
	profit_per = profit / totalinvestment * 100;
	profit = Math.abs(profit).toLocaleString('en-IN', {
		maximumFractionDigits: 0,
		style: 'currency',
		currency: 'INR'
	});
	currentValue = currentValue.toLocaleString('en-IN', {
		maximumFractionDigits: 0,
		style: 'currency',
		currency: 'INR'
	});
	if (cmp < avg) {
		$('#percentchange').html(profit_per.toFixed(2) + ' %').css('color', '#b70c0c');
		$('#netstat').html('Net Loss : <span class="net">' + profit + '</span>').css('color', '#b70c0c');
	} else {
		$('#percentchange').html(profit_per.toFixed(2) + ' %').css('color', '#076a07');
		$('#netstat').html('Net Profit : <span class="net">' + profit + '</span>').css('color', '#076a07');
		$('.progress').css('background-color', '#076a07');
	}
	$('.progress-bar').css('width', (100 - Math.abs(profit_per)) + '%');
	$('#cp').html(cmp.toLocaleString('en-IN', {
		maximumFractionDigits: 0,
		style: 'currency',
		currency: 'INR'
	}));
	let random = Math.floor(Math.random() * (11 - 5 + 1)) + 5;
	let buyprice = cmp - (cmp * random / 100);
	let buyqty = Math.floor(Math.random() * ((qty * 2 + 6) - (qty * 2 - 5) + 1)) + (qty * 2 - 5);
	let netg = Math.floor(Math.random() * 6 + 1);
	let sellp = Math.round(avg + avg * netg / 100);
	if (netg > 0) {
		$('#netg,#sellp').css('color', 'green');
	}
	if (netg < 0) {
		$('#netg,#sellp').css('color', 'red');
	}
	let selltotalqty = qty + buyqty;
	let finalinvestment = totalinvestment + buyprice * buyqty;
	let sellprice = finalinvestment / selltotalqty;
	let sellprofit =  Math.round(totalinvestment * netg / 100);
	totalinvestment = totalinvestment.toLocaleString('en-IN', {
		maximumFractionDigits: 0,
		style: 'currency',
		currency: 'INR'
	});
	$('#invested').html(totalinvestment);
	$('#curvalue').html(currentValue);
	buyqty = Math.round(buyqty);
	buyprice = Math.round(buyprice);
	$('#buyqty').val(buyqty);
	$('.footertext .buyqty').html(' '+buyqty);
	$('.footertext .buyprice').html(' '+buyprice);
	$('.footertext .addtotal').html(' '+buyprice*buyqty);
	$('.footertext .totalinvested').html(' '+ Math.round(finalinvestment));
	$('.footertext .profit').html(' 0');
	$('.footertext .sell-profit').html(' '+sellprofit);
	$('#buyprice').val(buyprice);
	$('#sellprice').val(Math.round(sellprice));
	$('#sellp').val(sellp);
	$('#netg').val(netg);
	$('#netgain').val(0);
	DynamicInputWidthChange();
});

function DynamicInputWidthChange() {
	$('.finalresult input').each(function () {
		$(this).width($(this).val().length > 0 ? $(this).val().length * 48 : 48);
	});
}
// (qty * avg + buyqty * buyprice) / (qty + buyqty) = sellprice /(1 + percent/100)
// buyprice = (sellprice * (qty + buyqty) /(1 + percent/100) - (qty * avg))/buyqty

$('body').on('input', '#buyqty,#buyprice,#netgain', function () {

	var buyqty = parseInt($('#buyqty').val());
	var qty = parseInt($('#qty').val());
	var avg = parseInt($('#avg').val());
	var buyprice = parseInt($('#buyprice').val());
	var sellprice = parseInt($('#sellprice').val());
	var netgain = $("#netgain").val();
	var selltotalqty = qty + buyqty;
	var totalinvestment = (qty * avg + buyprice * buyqty); 
	var sellprice = totalinvestment / selltotalqty;
	sellprice = Math.round(sellprice + sellprice * netgain / 100);
	if (netgain > 0) {
		$('#netgain,#sellprice').css('color', 'green');
	}
	if (netgain < 0) {
		$('#netgain,#sellprice').css('color', 'red');
	}
	$('#sellprice').val(sellprice);
	$('.footertext .buyqty').html(' '+buyqty);
	$('.footertext .buyprice').html(' '+buyprice);
	$('.footertext .addtotal').html(' '+buyprice*buyqty);
	$('.footertext .totalinvested').html(' '+ Math.round(totalinvestment));
	$('.footertext .profit').html(' '+ Math.round(totalinvestment*netgain/100));
	DynamicInputWidthChange();

});

$('body').on('input', '#sellp', function () {
	var qty = parseInt($('#qty').val());
	var avg = parseInt($('#avg').val());
	var sellprice = parseInt($('#sellp').val());
	var netgain = Math.round((sellprice - avg) / avg * 100);
	if (netgain > 0) {
		$('#netg,#sellp').css('color', 'green');
	}
	if (netgain < 0) {
		$('#netg,#sellp').css('color', 'red');
	}
	$('#netg').val(netgain);
	$('.footertext .sell-profit').html(' '+ Math.round(qty*avg*netgain/100));
	DynamicInputWidthChange();
});

$('body').on('input', '#sellprice', function () {
	var buyqty = parseInt($('#buyqty').val());
	var qty = parseInt($('#qty').val());
	var avg = parseInt($('#avg').val());
	var sellprice = parseInt($('#sellprice').val());
	var netgain = $("#netgain").val();

	var selltotalqty = qty + buyqty;
	var buyprice = (sellprice * (qty + buyqty) / (1 + netgain / 100) - (qty * avg)) / buyqty;
	var totalinvested = qty*avg + buyprice*buyqty;
	var profit = totalinvested * netgain / 100;
	if (buyprice < 0) {
		$('#sellprice').css('color', 'red');
		$('#sellprice').effect('shake', {
			times: 2,
			distance: 7
		}, 450, function () {
			$('#sellprice').css('color', 'white');
		});
		return;
	}
	buyprice = Math.round(buyprice);
	//  $(this).width($(this).val().length * 48);
	$('#buyprice').val(buyprice);
	$('.footertext .buyqty').html(' '+buyqty);
	$('.footertext .buyprice').html(' '+buyprice);
	$('.footertext .addtotal').html(' '+buyprice*buyqty);
	$('.footertext .totalinvested').html(' '+ Math.round(totalinvested));
	$('.footertext .profit').html(' '+ Math.round(profit));
	DynamicInputWidthChange();
});
$('body').on('click', '.close', function () {
	$('#welldone').hide();
});
$('body').on('click', 'a', function () {
	$('#welldone').show();
});


$('body').on('input', '#netg', function () {
	var avg = parseInt($('#avg').val());
	var qty = parseInt($('#qty').val());
	var netgain = parseInt($('#netg').val());

	var sellprice = Math.round(avg + avg * netgain / 100);
	if (netgain > 0) {
		$('#netg,#sellp').css('color', 'green');
	}
	if (netgain < 0) {
		$('#netg,#sellp').css('color', 'red');
	}
	$('#sellp').val(sellprice);
	$('.footertext .sell-profit').html(' '+ Math.round(qty*avg*netgain/100));
	//  $(this).width($(this).val().length * 48);
	DynamicInputWidthChange();

});
let ct = localStorage.getItem("visited");
if(!ct || ct == 'NaN'){
    localStorage.setItem("visited",parseInt(1));
}
else{
   if(ct >= 3){
      $('.first').hide();
   }
   localStorage.setItem("visited",parseInt(ct)+1);
}