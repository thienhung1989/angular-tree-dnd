angular.module('ntt.TreeDnD')
       .factory(
           '$TreeDnDHelper', [
               '$document', '$window', function ($document, $window) {
                   var _$helper = {
                       nodrag:          function (targetElm) {
                           return typeof targetElm.attr('data-nodrag') !== 'undefined';
                       },
                       eventObj:        function (e) {
                           var obj = e;
                           if (e.targetTouches !== undefined) {
                               obj = e.targetTouches.item(0);
                           } else if (e.originalEvent !== undefined && e.originalEvent.targetTouches !== undefined) {
                               obj = e.originalEvent.targetTouches.item(0);
                           }
                           return obj;
                       },
                       dragInfo:        function (scope) {
                           var _node   = scope.getData(),
                               _tree   = scope.getScopeTree(),
                               _parent = scope.getNode(_node.__parent_real__);
                           return {
                               node:    _node,
                               parent:  _parent,
                               move:    {
                                   parent: _parent,
                                   pos:    _node.__index__
                               },
                               scope:   scope,
                               target:  _tree,
                               drag:    _tree,
                               drop:    scope.getPrevSibling(_node),
                               changed: false
                           };
                       },
                       height:          function (element) {
                           return element.prop('scrollHeight');
                       },
                       width:           function (element) {
                           return element.prop('scrollWidth');
                       },
                       offset:          function (element) {
                           var boundingClientRect = element[0].getBoundingClientRect();
                           return {
                               width:  element.prop('offsetWidth'),
                               height: element.prop('offsetHeight'),
                               top:    boundingClientRect.top + ($window.pageYOffset || $document[0].body.scrollTop || $document[0].documentElement.scrollTop),
                               left:   boundingClientRect.left + ($window.pageXOffset || $document[0].body.scrollLeft || $document[0].documentElement.scrollLeft)
                           };
                       },
                       positionStarted: function (e, target) {
                           var pos     = {};
                           pos.offsetX = e.pageX - this.offset(target).left;
                           pos.offsetY = e.pageY - this.offset(target).top;
                           pos.startX  = pos.lastX = e.pageX;
                           pos.startY = pos.lastY = e.pageY;
                           pos.nowX = pos.nowY = pos.distX = pos.distY = pos.dirAx = 0;
                           pos.dirX = pos.dirY = pos.lastDirX = pos.lastDirY = pos.distAxX = pos.distAxY = 0;
                           return pos;
                       },
                       positionMoved:   function (e, pos, firstMoving) {
                           // mouse position last events
                           pos.lastX    = pos.nowX;
                           pos.lastY    = pos.nowY;
                           // mouse position this events
                           pos.nowX     = e.pageX;
                           pos.nowY     = e.pageY;
                           // distance mouse moved between events
                           pos.distX    = pos.nowX - pos.lastX;
                           pos.distY    = pos.nowY - pos.lastY;
                           // direction mouse was moving
                           pos.lastDirX = pos.dirX;
                           pos.lastDirY = pos.dirY;
                           // direction mouse is now moving (on both axis)
                           pos.dirX     = pos.distX === 0 ? 0 : pos.distX > 0 ? 1 : -1;
                           pos.dirY     = pos.distY === 0 ? 0 : pos.distY > 0 ? 1 : -1;
                           // axis mouse is now moving on
                           var newAx    = Math.abs(pos.distX) > Math.abs(pos.distY) ? 1 : 0;
                           // do nothing on first move
                           if (firstMoving) {
                               pos.dirAx  = newAx;
                               pos.moving = true;
                               return;
                           }
                           // calc distance moved on this axis (and direction)
                           if (pos.dirAx !== newAx) {
                               pos.distAxX = 0;
                               pos.distAxY = 0;
                           } else {
                               pos.distAxX += Math.abs(pos.distX);
                               if (pos.dirX !== 0 && pos.dirX !== pos.lastDirX) {
                                   pos.distAxX = 0;
                               }
                               pos.distAxY += Math.abs(pos.distY);
                               if (pos.dirY !== 0 && pos.dirY !== pos.lastDirY) {
                                   pos.distAxY = 0;
                               }
                           }
                           pos.dirAx = newAx;
                       },
                       replaceIndent:   function (scope, element, indent, attr) {
                           attr = attr || 'left';
                           angular.element(element.children()[0]).css(attr, scope.$callbacks.calsIndent(indent));
                       }
                   };
                   return _$helper;
               }]
       );