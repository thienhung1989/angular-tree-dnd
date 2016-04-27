angular.module('ntt.TreeDnD')
    .factory('$TreeDnDViewport', fnInitTreeDnDViewport);

fnInitTreeDnDViewport.$inject = ['$window', '$document', '$timeout', '$q', '$compile'];

function fnInitTreeDnDViewport($window, $document, $timeout, $q, $compile) {

    var viewport      = null,
        isUpdating    = false,
        isRender      = false,
        updateAgain   = false,
        viewportRect,
        items         = [],
        nodeTemplate,
        updateTimeout,
        renderTime,
        $initViewport = {
            setViewport:   setViewport,
            getViewport:   getViewport,
            add:           add,
            setTemplate:   setTemplate,
            getItems:      getItems,
            updateDelayed: updateDelayed
        },
        eWindow       = angular.element($window);

    eWindow.on('load resize scroll', updateDelayed);

    return $initViewport;

    function update() {

        viewportRect = {
            width:  eWindow.prop('offsetWidth') || document.documentElement.clientWidth,
            height: eWindow.prop('offsetHeight') || document.documentElement.clientHeight,
            top:    $document[0].body.scrollTop || $document[0].documentElement.scrollTop,
            left:   $document[0].body.scrollLeft || $document[0].documentElement.scrollLeft
        };

        if (isUpdating || isRender) {
            updateAgain = true;
            return;
        }
        isUpdating = true;

        recursivePromise();
    }

    function recursivePromise() {
        if (isRender) {
            return;
        }

        var number = number > 0 ? number : items.length, item;

        if (number > 0) {
            item = items[0];

            isRender   = true;
            renderTime = $timeout(function () {
                //item.element.html(nodeTemplate);
                //$compile(item.element.contents())(item.scope);

                items.splice(0, 1);
                isRender = false;
                number--;
                $timeout.cancel(renderTime);
                recursivePromise();
            }, 0);

        } else {
            isUpdating = false;
            if (updateAgain) {
                updateAgain = false;
                update();
            }
        }

    }

    /**
     * Check if a point is inside specified bounds
     * @param x
     * @param y
     * @param bounds
     * @returns {boolean}
     */
    function pointIsInsideBounds(x, y, bounds) {
        return x >= bounds.left &&
               y >= bounds.top &&
               x <= bounds.left + bounds.width &&
               y <= bounds.top + bounds.height;
    }

    /**
     * @name setViewport
     * @desciption Set the viewport element
     * @param element
     */
    function setViewport(element) {
        viewport = element;
    }

    /**
     * Return the current viewport
     * @returns {*}
     */
    function getViewport() {
        return viewport;
    }

    /**
     * trigger an update
     */
    function updateDelayed() {
        $timeout.cancel(updateTimeout);
        updateTimeout = $timeout(function () {
            update();
        }, 0);
    }

    /**
     * Add listener for event
     * @param element
     * @param callback
     */
    function add(scope, element) {
        updateDelayed();
        items.push({
            element: element,
            scope:   scope
        });
    }

    function setTemplate(scope, template) {
        nodeTemplate = template;
    }

    /**
     * Get list of items
     * @returns {Array}
     */
    function getItems() {
        return items;
    }
}