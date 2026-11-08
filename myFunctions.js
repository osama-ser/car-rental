// myFunctions.js
// ملف الجافاسكريبت الوحيد للموقع - تحتوي عليه كل التوابع

var DISCOUNT_DAYS = 10;      // الخصم عند تجاوز 10 أيام
var DISCOUNT_RATE = 0.05;    // نسبة الخصم 5%

// ---------------------------------------------------------
// توابع التحقق من المدخلات (نستخدم search مع التعابير النظامية)
// كل تابع يرجع نص الخطأ، أو نص فارغ إذا كانت القيمة صحيحة
// ---------------------------------------------------------

// الاسم: أحرف عربية فقط (يمكن أن يكون فارغا)
function checkName(name) {
  if (name == "") {
    return "";
  }
  var pos = name.search(/^[ء-ي]+( [ء-ي]+)*$/);
  if (pos == -1) {
    return "الاسم يجب أن يحتوي أحرفا عربية فقط";
  }
  return "";
}

// الرقم الوطني: إلزامي - 11 خانة - أول خانتين من 01 الى 14
function checkNationalId(id) {
  if (id == "") {
    return "الرقم الوطني إلزامي";
  }
  var pos = id.search(/^\d{11}$/);
  if (pos == -1) {
    return "الرقم الوطني يجب أن يتكون من 11 رقما";
  }
  var province = parseInt(id.substring(0, 2));
  if (province < 1 || province > 14) {
    return "أول خانتين يجب أن تكونا بين 01 و 14";
  }
  return "";
}

// رقم الموبايل: Syriatel (093, 098, 099) و MTN (094, 095, 096)
function checkMobile(mobile) {
  if (mobile == "") {
    return "";
  }
  var pos = mobile.search(/^09(3|4|5|6|8|9)\d{7}$/);
  if (pos == -1) {
    return "رقم الموبايل لا يطابق شبكتي Syriatel و MTN";
  }
  return "";
}

// البريد الالكتروني
function checkEmail(email) {
  if (email == "") {
    return "";
  }
  var pos = email.search(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*\.[a-zA-Z]{2,4}$/);
  if (pos == -1) {
    return "صيغة البريد الالكتروني غير صحيحة";
  }
  return "";
}

// تحويل نص بصيغة yyyy-mm-dd الى تاريخ (يرجع null اذا كان غير صحيح)
function makeDate(text) {
  var pos = text.search(/^\d{4}-\d{2}-\d{2}$/);
  if (pos == -1) {
    return null;
  }
  var year = parseInt(text.substring(0, 4));
  var month = parseInt(text.substring(5, 7), 10);
  var day = parseInt(text.substring(8, 10), 10);
  var d = new Date(year, month - 1, day);
  // نتأكد أن التاريخ حقيقي (مثلا 2026-02-30 غير صحيح)
  if (d.getFullYear() != year || d.getMonth() != month - 1 || d.getDate() != day) {
    return null;
  }
  return d;
}

function checkStartDate(text) {
  if (text == "") {
    return "تاريخ البداية إلزامي";
  }
  if (makeDate(text) == null) {
    return "الصيغة المطلوبة yyyy-mm-dd وتاريخ صحيح";
  }
  return "";
}

function checkEndDate(endText, startText) {
  if (endText == "") {
    return "تاريخ النهاية إلزامي";
  }
  var end = makeDate(endText);
  if (end == null) {
    return "الصيغة المطلوبة yyyy-mm-dd وتاريخ صحيح";
  }
  var start = makeDate(startText);
  if (start != null && end <= start) {
    return "تاريخ النهاية يجب أن يكون لاحقا لتاريخ البداية";
  }
  return "";
}

// ---------------------------------------------------------
// توابع الحساب
// ---------------------------------------------------------

// عدد الأيام بين تاريخين
function countDays(start, end) {
  var oneDay = 1000 * 60 * 60 * 24;
  return Math.round((end - start) / oneDay);
}

// السعر اليومي من النص (مثلا "250000 ل.س" يصبح 250000)
function getPrice(i) {
  var text = $("#price-" + i).text();
  return parseInt(text);
}

// ارجاع أرقام السيارات المختارة (اعتمادا على id الخاص بصندوق الاختيار sel-1 ...)
function getSelected() {
  var list = new Array();
  var boxes = $("input.select-car:checked");
  for (var i = 0; i < boxes.length; i++) {
    var id = boxes[i].id;            // مثل sel-3
    list[list.length] = id.substring(4);
  }
  return list;
}

// عرض أسماء السيارات المختارة فوق النموذج
function showSelectedNames() {
  var list = getSelected();
  var names = "";
  for (var i = 0; i < list.length; i++) {
    names = names + $("#model-" + list[i]).text();
    if (i < list.length - 1) {
      names = names + " ، ";
    }
  }
  $("#selectedList").text(names);
}

// كتابة رسالة الخطأ بجانب الحقل
function setError(field, msg) {
  $("#err-" + field).text(msg);
  if (msg == "") {
    return true;
  }
  return false;
}

// بناء نص النتيجة وعرضها
function showResult(list, startText, endText) {
  var days = countDays(makeDate(startText), makeDate(endText));
  var total = 0;
  var html = "<h3>تم قبول الطلب</h3>";
  html = html + "<p>مدة التأجير من " + startText + " إلى " + endText + " (" + days + " يوم)</p>";
  html = html + "<table><tr><th>السيارة</th><th>السعر اليومي</th><th>عدد الأيام</th><th>المجموع</th></tr>";
  var msg = "السيارات المختارة:\n";

  for (var i = 0; i < list.length; i++) {
    var price = getPrice(list[i]);
    var model = $("#model-" + list[i]).text();
    var sub = price * days;
    total = total + sub;
    html = html + "<tr><td>" + model + "</td><td>" + price + "</td><td>" + days + "</td><td>" + sub + "</td></tr>";
    msg = msg + model + " - " + days + " يوم\n";
  }
  html = html + "</table>";

  var discount = 0;
  if (days > DISCOUNT_DAYS) {
    discount = total * DISCOUNT_RATE;
  }
  var finalTotal = total - discount;

  html = html + "<p>المجموع: " + total + " ل.س</p>";
  html = html + "<p>الخصم: " + discount + " ل.س</p>";
  html = html + "<p><b>المبلغ النهائي: " + finalTotal + " ل.س</b></p>";
  msg = msg + "المجموع: " + total + "\nالخصم: " + discount + "\nالمبلغ النهائي: " + finalTotal + " ل.س";

  $("#result").html(html);
  $("#result").css("display", "block");
  alert(msg);
}

// ---------------------------------------------------------
// ربط الأحداث باستخدام jQuery
// ---------------------------------------------------------
$(document).ready(function () {

  // صفحة من نحن: اظهار/اخفاء تفاصيل الفرع عند الضغط على اسمه
  $(".branch-title").click(function () {
    $(this).next().toggleClass("hidden");
  });

  // صفحة السيارات: اظهار/اخفاء التفاصيل (يمكن اظهار عدة سيارات معا)
  $("input.show-details").click(function () {
    $("#details-" + this.value).toggleClass("shown");
  });

  // تحديث أسماء السيارات المختارة
  $("input.select-car").click(function () {
    showSelectedNames();
  });

  // زر متابعة
  $("#continueBtn").click(function () {
    var list = getSelected();
    if (list.length == 0) {
      $("#selectMsg").text("الرجاء اختيار سيارة واحدة على الأقل");
    } else {
      $("#selectMsg").text("");
      showSelectedNames();
      $("#bookingBox").css("display", "block");
    }
  });

  // نمنع تحقق المتصفح الافتراضي لأننا نتحقق بالجافاسكريبت
  $("#bookingForm").attr("novalidate", "novalidate");

  // ارسال النموذج
  $("#bookingForm").submit(function () {
    $("#result").css("display", "none");

    var name = $("#fullName").val();
    var id = $("#nationalId").val();
    var start = $("#startDate").val();
    var end = $("#endDate").val();
    var mobile = $("#mobile").val();
    var email = $("#email").val();

    var ok = true;
    if (!setError("fullName", checkName(name))) { ok = false; }
    if (!setError("nationalId", checkNationalId(id))) { ok = false; }
    if (!setError("startDate", checkStartDate(start))) { ok = false; }
    if (!setError("endDate", checkEndDate(end, start))) { ok = false; }
    if (!setError("mobile", checkMobile(mobile))) { ok = false; }
    if (!setError("email", checkEmail(email))) { ok = false; }

    var list = getSelected();
    if (list.length == 0) {
      $("#selectMsg").text("الرجاء اختيار سيارة واحدة على الأقل");
      ok = false;
    }

    if (ok) {
      showResult(list, start, end);
    }
    return false;   // لا نرسل النموذج فعليا
  });
});
