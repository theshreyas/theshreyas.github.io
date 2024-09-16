// Restricts input for the set of matched elements to the given inputFilter function.
(function($) {
    $.fn.inputFilter = function(inputFilter) {
        return this.on("input keydown keyup mousedown mouseup select contextmenu drop", function() {
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
$(document).ready(function() {
    $("input").inputFilter(function(value) {
        return /\d*\.?\d*/.test(value); //only digits & dots accepted
    });
    $('#cmp').val(localStorage.getItem("cmp"));
    $('#qty').val(localStorage.getItem("qty"));
    $('#avg').val(localStorage.getItem("avg"));
    DynamicInputWidthChange();
    $('body').on('click', 'li', function(e) {
        if (!$(e.currentTarget).hasClass('active')) {
            $('li,.selltype').toggleClass('active');
        }
    });
});
$(".goback").click(function() {
    $(".inputForm,.otherbuttons").show();
    $(".result,.nav,.goback").hide();
});
$('body').on('click', '#averageCalculator', function(e) {
    $('.lossCalculator,.percentageCalculator,#averageCalculator').hide();
    $('.averageCalculator,#percentageCalculator,#lossCalculator').show();
    // $('#lossCalculator').css('display','block');
    // var id = $(this).html('Loss Calculator').attr('id', 'lossCalculator');
    // console.log(id);
});
$('body').on('click', '#percentageCalculator', function() {
    $('.lossCalculator,.averageCalculator,#percentageCalculator,.averageResult').hide();
    $('.percentageCalculator,#averageCalculator,#lossCalculator').show();
});
$('body').on('click', '#lossCalculator', function() {
    $('.percentageCalculator,.averageCalculator,#lossCalculator,.averageResult').hide();
    $('.lossCalculator,#averageCalculator,#percentageCalculator').show();
});
$(document).on('input', '#percent_base,#percent_final,#percent', function(e) {
    var id = $(this).attr('id');
    if (id == 'percent_base') {
        let base = parseFloat(e.target.value);
        let final = parseFloat($('#percent_final').val());
        let percent = parseFloat($('#percent').val());
        if ($('#percent_final').val() != '' && e.target.value != '') {
            $('#percent').val(((final - base) / base * 100).toFixed(1));
        } else if ($('#percent').val() != '' && e.target.value != '') {
            $('#percent_final').val((base + (base * percent / 100)).toFixed(1));
        }
    }
    if (id == 'percent_final') {
        let base = parseFloat($('#percent_base').val());
        let final = parseFloat(e.target.value);
        let percent = parseFloat($('#percent').val());
        if ($('#percent_base').val() != '' && e.target.value != '') {
            $('#percent').val(((final - base) / base * 100).toFixed(1));
        } else if ($('#percent').val() != '' && e.target.value != '') {
            $('#percent_base').val((final * 100 / (100 + percent)).toFixed(1));
        }
    }
    if (id == 'percent') {
        let base = parseFloat($('#percent_base').val());
        let final = parseFloat($('#percent_final').val());
        let percent = parseFloat(e.target.value);
        if ($('#percent_base').val() != '' && e.target.value != '') {
            $('#percent_final').val((base + (base * percent / 100)).toFixed(1));
        } else if ($('#percent_final').val() != '' && e.target.value != '') {
            $('#percent_base').val((final * 100 / (100 + percent)).toFixed(1));
        }
    }
});
$('body').on('click', '.addmore', function() {
    var newField = $('#averageFields div.averageField:last').clone();
    var countr = $('.avg_qty').length + 1;
    newField.find('.avg_buy_price').attr('placeholder', 'Buy Price ' + countr).val('').css("border-color", "black");
    newField.find('.avg_qty').attr('placeholder', 'Stock Quantity ' + countr).val('').css("border-color", "black");
    if (!newField.find('.avg_close').length) {
        newField.prepend('<div style="height: 25px;width: 100%;"><div class="avg_close">[<i class="fa-solid fa-xmark"></i>]</div></div>');
    }
    $('#averageFields').append(newField);
});
$('body').on('click', '#StockPriceDisplay', function() {
    $(this).hide();
    $('#CurrentStockPrice').show();
    $('#currentPrice').focus();
});
$('body').on('click', '#closecurrentprice', function() {
    $('#StockPriceDisplay,#CurrentStockPrice').toggle();
});
$('body').on('click', '.avg_close', function() {
    $(this).closest('.averageField').remove();
    var i = 1;
    $('.avg_buy_price').each(function() {
        $(this).attr('placeholder', 'Buy Price ' + i++);
    });
    var j = 1;
    $('.avg_qty').each(function() {
        $(this).attr('placeholder', 'Stock Quantity ' + j++);
    });
});
$('body').on('click', '#averageCalculatorSubmit', function() {
    $('.averageCalculator input:visible').each(function() {
        if (!parseInt($(this).val())) {
            $(this).css('border-color', 'red');
            // var error = true;
        } else {
            $(this).css('border-color', 'black');
        }
    });
    $('.averageCalculator input:visible').each(function() {
        if (!parseInt($(this).val())) e.preventDefault();
    });
    let totalinvestment = 0;
    var totalqty = 0;
    for (var i = 0; i < $('.averageField').length; i++) {
        let buyprice = $('.avg_buy_price')[i].value;
        let buyqty = $('.avg_qty')[i].value;
        totalinvestment += buyprice * buyqty;
        totalqty += parseInt(buyqty);
    }
    let net = totalinvestment / totalqty;
    if ($('#currentPrice:visible').length) {
        $('.averageResult .progress,.averageResult .mb-4').show();
        let cmp = parseInt($('#currentPrice').val()) || 0;
        let profit = 0;
        let profit_per = 0;
        let currentValue = cmp * totalqty;
        let netgains = totalinvestment - currentValue;
        profit = currentValue - (totalinvestment);
        profit_per = profit / totalinvestment * 100;
        profit = FormatAmount(Math.abs(profit), 1);
        currentValue = FormatAmount(currentValue, 1); 
        let profitloss = (cmp < net ? ' <p class="bracket" style="color: #9a0000;">(-' : ' <p class="bracket" style="color: #0aff0a;">(+');
        if (cmp < net) { //loss
            $('.averageResult #percentchange').html(profit_per.toFixed(2) + ' %').css('color', '#b70c0c');
            $('.averageResult .progress').css('background-color', '#b70c0c');
        } else { //profit
            $('.averageResult #percentchange').html(profit_per.toFixed(2) + ' %').css('color', '#076a07');
            $('.averageResult .progress').css('background-color', '#076a07');
        }
        $('.averageResult .progress-bar').css('width', (100 - Math.abs(profit_per)) + '%');
        $('.averageResult #cp').html(currentValue + profitloss + FormatAmount(Math.abs(netgains)) + ')</p>');
    } else {
        $('.averageResult .progress,.averageResult .mb-4').hide();
    }
    net = FormatAmount(net, 1);
    totalinvestment = FormatAmount(totalinvestment, 1);
    $('.averageResult #invested').html(totalinvestment);
    $('.averageResult #curvalue').html(totalqty);
    $('.averageResult .net').html(net);
    $('.averageResult').show();
});

function FormatAmount(number, maximumFractionDigits = 0) {
    return number.toLocaleString('en-IN', {
        maximumFractionDigits: maximumFractionDigits,
        style: 'currency',
        currency: 'INR'
    });
}
$('body').on('click', '#lossCalculatorSubmit', function() {
    let cmp = parseInt($('#cmp').val()) || 0;
    let qty = parseInt($('#qty').val()) || 0;
    let avg = parseInt($('#avg').val()) || 0;
    $('.lossCalculator input').each(function() {
        if (!parseInt($(this).val())) $(this).css('border-color', 'red');
        else $(this).css('border-color', 'black');
    });
    if (cmp == 0 || qty == 0 || avg == 0) {
        return false;
    }
    localStorage.setItem("cmp", cmp);
    localStorage.setItem("qty", qty);
    localStorage.setItem("avg", avg);
    $(".inputForm,.otherbuttons").hide();
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
    profit = FormatAmount(Math.abs(profit));
    currentValue = FormatAmount(currentValue);
    if (cmp < avg) {
        $('#percentchange').html(profit_per.toFixed(2) + ' %').css('color', '#b70c0c');
        $('#netstat').html('Net Loss : <span class="net">' + profit + '</span>').css('color', '#b70c0c');
    } else {
        $('#percentchange').html(profit_per.toFixed(2) + ' %').css('color', '#076a07');
        $('#netstat').html('Net Profit : <span class="net">' + profit + '</span>').css('color', '#076a07');
        $('.progress').css('background-color', '#076a07');
    }
    $('.progress-bar').css('width', (100 - Math.abs(profit_per)) + '%');
    $('#cp').html(FormatAmount(cmp));
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
    let sellprofit = Math.round(totalinvestment * netg / 100);
    totalinvestment = FormatAmount(totalinvestment);
    $('#invested').html(totalinvestment);
    $('#curvalue').html(currentValue);
    buyqty = Math.round(buyqty);
    buyprice = Math.round(buyprice);
    $('#buyqty').val(buyqty);
    $('.footertext .buyqty').html(' ' + buyqty);
    $('.footertext .buyprice').html(' ' + buyprice);
    $('.footertext .addtotal').html(' ' + buyprice * buyqty);
    $('.footertext .totalinvested').html(' ' + Math.round(finalinvestment));
    $('.footertext .profit').html(' 0');
    $('.footertext .sell-profit').html(' ' + sellprofit);
    $('#buyprice').val(buyprice);
    $('#sellprice').val(Math.round(sellprice));
    $('#sellp').val(sellp);
    $('#netg').val(netg);
    $('#netgain').val(0);
    DynamicInputWidthChange();
});

function DynamicInputWidthChange() {
    $('.finalresult input').each(function() {
        $(this).width($(this).val().length > 0 ? $(this).val().length * 48 : 48);
    });
}
// (qty * avg + buyqty * buyprice) / (qty + buyqty) = sellprice /(1 + percent/100)
// buyprice = (sellprice * (qty + buyqty) /(1 + percent/100) - (qty * avg))/buyqty
$('body').on('input', '#buyqty,#buyprice,#netgain', function() {
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
    $('.footertext .buyqty').html(' ' + buyqty);
    $('.footertext .buyprice').html(' ' + buyprice);
    $('.footertext .addtotal').html(' ' + buyprice * buyqty);
    $('.footertext .totalinvested').html(' ' + Math.round(totalinvestment));
    $('.footertext .profit').html(' ' + Math.round(totalinvestment * netgain / 100));
    DynamicInputWidthChange();
});
$('body').on('input', '#sellp', function() {
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
    $('.footertext .sell-profit').html(' ' + Math.round(qty * avg * netgain / 100));
    DynamicInputWidthChange();
});
$('body').on('input', '#sellprice', function() {
    var buyqty = parseInt($('#buyqty').val());
    var qty = parseInt($('#qty').val());
    var avg = parseInt($('#avg').val());
    var sellprice = parseInt($('#sellprice').val());
    var netgain = $("#netgain").val();
    var selltotalqty = qty + buyqty;
    var buyprice = (sellprice * (qty + buyqty) / (1 + netgain / 100) - (qty * avg)) / buyqty;
    var totalinvested = qty * avg + buyprice * buyqty;
    var profit = totalinvested * netgain / 100;
    if (buyprice < 0) {
        $('#sellprice').css('color', 'red');
        $('#sellprice').effect('shake', {
            times: 2,
            distance: 7
        }, 450, function() {
            $('#sellprice').css('color', 'white');
        });
        return;
    }
    buyprice = Math.round(buyprice);
    //  $(this).width($(this).val().length * 48);
    $('#buyprice').val(buyprice);
    $('.footertext .buyqty').html(' ' + buyqty);
    $('.footertext .buyprice').html(' ' + buyprice);
    $('.footertext .addtotal').html(' ' + buyprice * buyqty);
    $('.footertext .totalinvested').html(' ' + Math.round(totalinvested));
    $('.footertext .profit').html(' ' + Math.round(profit));
    DynamicInputWidthChange();
});
$('body').on('click', '.clear button', function() {
    $(this).closest('.form').find('input').val('');
});
// $('body').on('click', '.close', function () {
// 	$('#welldone').hide();
// });
// $('body').on('click', 'a', function () {
// 	$('#welldone').show();
// });
$('body').on('input', '#netg', function() {
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
    $('.footertext .sell-profit').html(' ' + Math.round(qty * avg * netgain / 100));
    //  $(this).width($(this).val().length * 48);
    DynamicInputWidthChange();
});
let ct = localStorage.getItem("visited");
if (!ct || ct == 'NaN') {
    localStorage.setItem("visited", parseInt(1));
} else {
    if (ct >= 3) {
        $('.first').hide();
    }
    localStorage.setItem("visited", parseInt(ct) + 1);
}