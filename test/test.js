function initViewableCounter(e, img, onViewImp) {

    var obj = {};

    function getBounding() {
        var b = e.getBoundingClientRect();
        var result = {};

        result.left = b.left;
        result.top = b.top;
        result.bottom = b.bottom;
        result.right = b.right;
        return result;
    }

    function getViewablePercent() {
        var area = e.width * e.height;
        var rect = getBounding();

        var pageWidth = document.body.clientWidth;
        var pageHeight = document.body.clientHeight;

        if (rect.left < 0) {
            rect.left = 0;
        }

        if (rect.top < 0) {
            rect.top = 0;
        }

        if (rect.right > pageWidth) {
            rect.right = pageWidth;
        }

        if (rect.bottom > pageHeight) {
            rect.bottom = pageHeight;
        }

        var w = rect.right - rect.left;
        var h = rect.bottom - rect.top;

        if (w < 0) {
            return 0;
        }

        if (h < 0) {
            return 0;
        }

        return w * h / area;
    }

    function isRenderFinished() {
        return e.complete;
    }

    function isViewable() {
        if (!isRenderFinished()) {
            return false;
        }

        return getViewablePercent() >= 0.5;
    }


    var sent = false;
    var loaded = false;
    var viewableStart = null;
    var inViewableTime = 0;
    var totalViewableTime = 0;

    img.addEventListener('load', function () {
        loaded = true;
    });

    function hasFocus() {
        return document.hasFocus();
    }

    function inViewablePoll() {

        var now = new Date()

        if (!hasFocus()) {
            if (viewableStart != null) {
                totalViewableTime += now - viewableStart;
            }

            viewableStart = null;
            inViewableTime = 0;
            return;
        }

        if (!loaded) {
            return;
        }

        if (isViewable()) {
            if (viewableStart == null) {
                viewableStart = now;
            }
        } else {

            if (viewableStart != null) {
                totalViewableTime += now - viewableStart;
            }

            viewableStart = null;
            inViewableTime = 0;
            return;
        }

        inViewableTime = now - viewableStart;

        if (inViewableTime > 1000 && !sent) {

            if (onViewImp) {
                onViewImp(inViewableTime);
            }
            sent = true;
        }
    }

    window.setInterval(inViewablePoll, 100);

    obj.isViewable = isViewable;
    obj.isRenderFinished = isRenderFinished;
    obj.getViewablePercent = getViewablePercent;
    obj.getInViewableTime = function () {
        return inViewableTime;
    }

    obj.getTotalViewableTime = function () {
        return totalViewableTime + inViewableTime;
    }

    return obj;
}


function updateStatus(e, status) {
    e.innerText = status;
}


function initialize() {

    var elem = document.getElementById('ad');
    var stelem = document.getElementById('status');
    var totalelem = document.getElementById('total');

    elem.addEventListener('load', function (elem) {
        elem.complete = true;
    });

    elem.setAttribute('src', 'python-logo.png');

    var obj = initViewableCounter(elem, elem);

    function updateViewable() {

        if (!obj.isRenderFinished()) {
            updateStatus(stelem, '読まれてない');
            return;
        }

        var viewable = obj.isViewable();

        if (viewable) {
            updateStatus(stelem, '50%以上みえる. ' + obj.getViewablePercent()*100 + '%');
        } else {
            updateStatus(stelem, '50%未満しかみえない. ' + obj.getViewablePercent()*100 + '%');
        }
    }

    window.setInterval(updateViewable, 100);

    var startTime = null;
    var sent = false;

    function viewablePoll() {

        var e = document.getElementById('sent');

        var t = obj.getTotalViewableTime();
        updateStatus(totalelem, t + '[ms] 表示されてた');

        if (sent) {
            return;
        }

        if (obj.isViewable()) {
            if (startTime == null) {
                startTime = new Date();
            }
        } else {
            startTime = null;
            updateStatus(e, 0);
            return;
        }

        var timediff = obj.getInViewableTime();


        if (timediff >= 1000) {
            sent = true;
            updateStatus(e, '一秒表示された');
        } else {
            updateStatus(e, timediff);
        }
    }

    window.setInterval(viewablePoll, 100);
    window.onscroll = updateViewable;
}

initialize();
