define('yb',['jquery/jquery/1.9.1/jquery','lodash/lodash/2.1.0/lodash'],function(b,c,d){var a=b('jquery/jquery/1.9.1/jquery');a.fn.classOnHover=function(b){return b=b||'hover',this.each(function(){a(this).focus(function(){a(this).addClass(b);}).blur(function(){a(this).removeClass(b);});});},a(function(){b('lodash/lodash/2.1.0/lodash').each(a('a[href]').classOnHover(),function(){});});});