$(function(){
	jQuery.fn.monthlyCalendar = function monthlyCalendar(options) {
		calendarSelector = $(this);
		var root = this;
		var vars = {
			defaultDate: moment().format("YYYY-MM-DD"),
			highlightDfDate: true,
			lang: 'en',
			startMonth: 1,
			endMonth: 12,
			monthWrapperClass: '',
			monthWrapperBorder:1,
			monthWrapperStyle: 'min-height:180px;float:left;width:250px',
			dayClass: '',
			border: 0,
			events: [],
			init: function(date,element){},
			ready: function(date,element){},
			dayClick: function(date,element,wrapper){}
		}
		var default_dayClick=vars.dayClick.toString();
		var monthText = '<div class="monthly_calendar_container"></div>';
		var monthSelector = $(monthText);
		var momentObj=moment();

		var start_day;
		var str='';
		
		var arrEventsKeys=[];
		
		
		this.construct = function(options){
			//this.destroy();
			root.init(options);
			/*
			$.when( $.extend(vars , options) ).done(function( ) {
						
				//$.when( init_callback() ).done(function( ) {
				if( init_callback()) {
					root.init(options);
				}
				//});

				function init_callback(){
					if(typeof vars.init == 'function') {
					vars.init.call(root,moment(vars.defaultDate),calendarSelector);
					return true;
					}
					return false;
				}
				
			});
			*/
		}

		this.init = function(options){
			$.extend(vars , options);
			if(typeof vars.init == 'function') vars.init.call(this,moment(vars.defaultDate),calendarSelector);
			this.fetchEvents();
			if ( vars.startMonth>0 && vars.startMonth<=12 && vars.endMonth>0 && vars.endMonth<=12 && vars.startMonth<=vars.endMonth) {
				vars.startMonth--;
				vars.endMonth--;
				momentObj=moment(vars.defaultDate).month(vars.startMonth).startOf('month');
				var f = momentObj.lang(vars.lang) || momentObj.locale(vars.lang);
				start_day=momentObj.weekday()+1;
				this.render();
				if(typeof vars.ready == 'function') vars.ready.call(root,moment(vars.defaultDate),monthSelector);
				
			}
		}

		this.destroy = function() {
			calendarSelector.off(calendarSelector);
		}
		
		this.fetchEvents = function fetchEvents() {

			for (var i = 0; i < vars.events.length; i++) {
				if (('start' in vars.events[i])) {
				if (('title' in vars.events[i])) {
					arrEventsKeys.push(vars.events[i]['start']);
				}
				}
			}

		}
		
		this.contains = function contains(arr, date) {
			var result=false;
			for (var i = 0; i < arr.length; i++) {
				if (('start' in arr[i]) && arr[i]['start']==date) {
					if (('title' in arr[i])) {
						result=arr[i]['title']
					} else {
						result='';
					}
				}
			}
			return result;
		}

		this.render = function(num) {
			var months_done=0;
			for (var i=vars.startMonth;i<=vars.endMonth;i++) {
				months_done=this.renderMonth(i);
			}
			if(months_done == vars.endMonth) return true;
			return false;
		}
		this.renderMonth = function(num) {
			momentObj.month(num);
			str=monthSelector.html();
			
			str+=this.fill_table("January",momentObj.add(1,'months').date(0).format('DD'));
			//monthSelector.append(str).promise().done(function(){
			monthSelector.html(str);
			
				monthSelector.appendTo(calendarSelector).promise().done(function(){
				
					current_month=calendarSelector.find('.month_wrapper[data-month='+(num+1)+']');
					current_month_days=calendarSelector.find('.month_wrapper[data-month='+(num+1)+']').find('.day');
					
					$.each( current_month_days, function( key, value ) {
						if(typeof vars.dayClick == 'function' && vars.dayClick.toString()!=default_dayClick) {
							$(value).on('click',function(){
								 vars.dayClick.call(root,momentObj.month(num).date($(value).text()),$(this),$(this).parents('.month_wrapper'));
							});
							calendarSelector.find('.day').css('cursor','pointer');							
						}
					});
					
				});
				
			//});
			return num;
		}
		
		this.day_title = function(day_name){
			day_weekend=(momentObj.isoWeekday()==6 || momentObj.isoWeekday()==7)?this.setWeekendClass():'';
			return ("<td align='center' width='35' class='day-name "+day_weekend+"'><small>"+day_name+"</small></td>")
		}
		
		this.fill_table = function(month,month_length) {
			day=1;

			str=('<span class="month_wrapper '+vars.monthWrapperClass+'" style="border:'+vars.monthWrapperBorder+'px solid;'+vars.monthWrapperStyle+'" data-month='+momentObj.format('M')+'><table  class="calendar_table" border='+vars.border+' cellspacing=0 cellpadding=%0>');
			str+=("<tr><td colspan='7' align='center' class='month-name'>"+momentObj.format('MMMM')+"   "+momentObj.format('YYYY')+"</td></tr>");
			
			date_prefix=(momentObj.format("YYYY-MM-"));
			/*day names*/
			str+="<tr>";
			for (var i=0;i<7;i++) {
				str+= this.day_title(momentObj.weekday(i).format('ddd'));
			}
			str+=("</tr><tr>");
			for (var i=1;i<start_day;i++) {
				str+=("<td></td>");
			}
			for (var i=start_day;i<=7;i++) {
				str+=this.createDayTag(i,date_prefix,day);
				day++;
			}
			str+=("<tr>");
			while (day <= month_length) {
				for (var i=1;i<=7 && day<=month_length;i++) {
					str+=this.createDayTag(i,date_prefix,day);
					day++;
				}
				str+=("</tr><tr>")
				start_day=i
			}
			str+=("</tr>")
			str+=("</table>");
			str+=("</span>")
			return str;
		}
		this.createDayTag=function createDayTag(i,date_prefix,day){
			day_on=this.dayOn(date_prefix,day);
			day_weekend=this.dayWeekend(date_prefix,day);
			clss="class='day "+day_on.pop()+" "+day_weekend+" "+vars.dayClass+"'";
			title="title='"+day_on.pop()+"'";
			str=("<td align='center'><div "+clss+" "+title+">"+day+"</div></td>");
			
			return str;
		}
		this.pad=function pad(num, size) {
			var s = "000000000" + num;
			return s.substr(s.length-size);
		}
		this.dayOn=function(date_prefix,day) {
			day_on=' ';
			title='';
			res=new Array();
			var date=(date_prefix+this.pad(day, 2));
			if ( date == vars.defaultDate && vars.highlightDfDate) {day_on+='on';}
			var idx_in_arr=jQuery.inArray( date, arrEventsKeys );
			if (idx_in_arr>-1 ) {
				day_on+=' event';
				if (('eClass' in vars.events[idx_in_arr])) {
					day_on+=' '+vars.events[idx_in_arr]['eClass'];
				}
				if (('title' in vars.events[idx_in_arr])) {
				title=vars.events[idx_in_arr]['title'];
				}
				
			}
			res.push(title);
			res.push(day_on);
			
			return res;
		}
		this.dayWeekend=function(date_prefix,day) {
			if (moment(date_prefix+this.pad(day, 2)).isoWeekday() == 6 || moment(date_prefix+this.pad(day, 2)).isoWeekday() == 7) {
			  day_weekend = this.setWeekendClass();
			} 
			else { 
				day_weekend = ''; 
			}
			return day_weekend;
		}
		this.setWeekendClass=function() {
			return 'weekend';
		}
	this.construct(options);	
	}
	
	
		
});
		
/* Production steps of ECMA-262, Edition 5, 15.4.4.18 */ 
/* Reference: http://es5.github.io/#x15.4.4.18 */
if (!Array.prototype.forEach) {
  Array.prototype.forEach = function(callback, thisArg) {
    var T, k;
    if (this == null) {
      throw new TypeError(' this is null or not defined');
    }
    var O = Object(this);
    var len = O.length >>> 0;
    if (typeof callback !== "function") {
      throw new TypeError(callback + ' is not a function');
    }
    if (arguments.length > 1) {
      T = thisArg;
    }
    k = 0;
    while (k < len) {
      var kValue;
      if (k in O) {
        kValue = O[k];
        callback.call(T, kValue, k, O);
      }
      k++;
    }
  };
}
/* Production steps of ECMA-262, Edition 5, 15.4.4.14 */ 
/* Reference: http://es5.github.io/#x15.4.4.14 */
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(searchElement, fromIndex) {
    var k;
    if (this == null) {
      throw new TypeError('"this" is null or not defined');
    }
    var O = Object(this);
    var len = O.length >>> 0;
    if (len === 0) {
      return -1;
    }
    var n = +fromIndex || 0;
    if (Math.abs(n) === Infinity) {
      n = 0;
    }
    if (n >= len) {
      return -1;
    }
    k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
    while (k < len) {
      var kValue;
      if (k in O && O[k] === searchElement) {
        return k;
      }
      k++;
    }
    return -1;
  };
}	