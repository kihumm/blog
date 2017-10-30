
/**
 * 
 */
var getDateHelper = function(){
	 "use strict";
	 var constants = getConstants();
	return {
		constants: constants,
		
		date : getDate(),
		duration : getDurationHelper(),
		
		dateDiff : dateDiff,
		dateDiffResult : dateDiffResult,
		dateDiffResultFull : dateDiffResultFull,
		dateToStr : dateToStr,
		datetimeToStr : datetimeToStr,
		timeToStr : timeToStr,
		strToDate : strToDate,
		getOffsetDate : getOffsetDate,
		paramToDate : paramToDate,
		durationToStr : durationToStr,
		durationToObj : durationToObj,
		typeToStr : typeToStr,
		weekdayToStr : weekdayToStr,
		zhDateToStr : zhDateToStr,
		zhDatetimeToStr : zhDatetimeToStr,
		fillZero : fillZero
	};
	
	function getDate(){
		return {
			monthFirstDay : monthFirstDay,
			monthLastDay : monthLastDay
		};
		
		function monthFirstDay(date){
			return paramToDate(date.getFullYear(), date.getMonth());
		}
		function monthLastDay(date){
			var result = monthFirstDay(date);
			result = getOffsetDate(constants.type.month, result, 1);
			result = getOffsetDate(constants[constants.type.day], result, -1);
			return result;
		}
	}

	function getDurationHelper() {
		return {
			today : today,
			yestoday : yestoday,
			date: date,
			currentWeek : currentWeek,
			lastWeek : lastWeek,
			currentMonth : currentMonth,
			currentYear : currentYear,
			calendarMonth : calendarMonth,
			month : month,
			year : year
		};

		function today() {
			return getDurationStr(constants.type.date, new Date());
		}
		function yestoday() {
			return getDurationStr(constants.type.date, getOffsetDate(constants.type.date, new Date(), -1));
		}
		function date(date){
			return getDurationStr(constants.type.date, date);
		}
		function currentWeek(){
			return getDurationStr(constants.type.day, new Date());
		}
		function lastWeek(){
			return getDurationStr(constants.type.day, getOffsetDate(constants.type.date, new Date(), -7));
		}
		function currentMonth(){
			return getDurationStr(constants.type.month, new Date());
		}
		function currentYear(){
			return getDurationStr(constants.type.year, new Date());
		}
		function calendarMonth(year, month){
			var now = new Date();
			year = year || now.getFullYear();
			month = month || now.getMonth()+1;
			return getDurationStr(constants.type.calendarMonth, paramToDate(year, month-1));
		}
		function month(year, month){
			var now = new Date();
			year = year || now.getFullYear();
			month = month || now.getMonth()+1;
			return getDurationStr(constants.type.month, paramToDate(year, month-1));
		}
		function year(year){
			return getDurationStr(constants.type.year, paramToDate(year));
		}
	}
	
	function getDurationStr(type, startTime) {
		var result = getDuration(type, startTime);
		return {
			startTime : datetimeToStr(result['startTime']),
			endTime : datetimeToStr(result['endTime'])
		};
	}
	
	function getDuration(type, startTime) {
		var year, month, date, hour, minute, second;
		var day;
		var startTimeDate, endTimeDate;
		switch (type) {
		case constants.type.calendarMonth:
			year = startTime.getFullYear();
			month = startTime.getMonth();
			startTimeDate = paramToDate(year, month, date, hour, minute, second);
			endTimeDate = getOffsetDate(constants.type.month, startTimeDate, 1);
			var startTimeWeekDay = startTimeDate.getDay();
			var endTimeWeekDay = endTimeDate.getDay();
			startTimeDate = getOffsetDate(constants.type.date, startTimeDate, - startTimeWeekDay%7);
			endTimeDate = getOffsetDate(constants.type.date, endTimeDate, (7-endTimeWeekDay)%7);
			break;
		case constants.type.year:
			year = startTime.getFullYear();
			startTimeDate = paramToDate(year, month, date, hour, minute, second);
			endTimeDate = getOffsetDate(type, startTimeDate, 1);
			break;
		case constants.type.month:
			year = startTime.getFullYear();
			month = startTime.getMonth();
			startTimeDate = paramToDate(year, month, date, hour, minute, second);
			endTimeDate = getOffsetDate(type, startTimeDate, 1);
			break;
		case constants.type.date:
			year = startTime.getFullYear();
			month = startTime.getMonth();
			date = startTime.getDate();
			startTimeDate = paramToDate(year, month, date, hour, minute, second);
			endTimeDate = getOffsetDate(type, startTimeDate, 1);
			break;
		case constants.type.day:
			year = startTime.getFullYear();
			month = startTime.getMonth();
			date = startTime.getDate();
			day = startTime.getDay();
			date = date - (day+6)%7;
			startTimeDate = paramToDate(year, month, date, hour, minute, second);
			endTimeDate = getOffsetDate(constants.type.date, startTimeDate, 7);
			break;
		}
	
		return {
			startTime : startTimeDate,
			endTime : endTimeDate
		};
	}
	
	function dateDiff(type, date1, date2){
		var result = 0;
		switch (type) {
		case constants.type.year:
			result = Math.floor(((date1.getFullYear() - date2.getFullYear())*12+ date1.getMonth() - date2.getMonth())/12);break;
		case constants.type.month:
			result = (date1.getFullYear() - date2.getFullYear())*12 + date1.getMonth() - date2.getMonth() + (((date1.getDate()-date2.getDate())>=0?1:-1) +  (date1>=date2?-1: 1))/2;break;
		case constants.type.date:
			result = Math.floor(date1.getTime()/(1000*60*60*24))-Math.floor(date2.getTime()/(1000*60*60*24)); break;
		case constants.type.hour:
			result = Math.floor(date1.getTime()/(1000*60*60))-Math.floor(date2.getTime()/(1000*60*60)); break;
		case constants.type.minute:
			result = Math.floor(date1.getTime()/(1000*60))-Math.floor(date2.getTime()/(1000*60)); break;
		case constants.type.second:
			result = Math.floor(date1.getTime()/(1000))-Math.floor(date2.getTime()/(1000)); break;
		default:
			result = (date1.getTime()-date2.getTime());
		}
		return result;
	}
	
	function dateDiffResult(date1, date2){
		var offset, type;
		type = constants.type.year;
		offset = dateDiff(type, date1, date2);
		if(offset!==0)return {offset: offset, type: type};
		type = constants.type.month;
		offset = dateDiff(type, date1, date2);
		if(offset!==0)return {offset: offset, type: type};
		type = constants.type.date;
		offset = dateDiff(type, date1, date2);
		if(offset!==0)return {offset: offset, type: type};
		type = constants.type.hour;
		offset = dateDiff(type, date1, date2);
		if(offset!==0)return {offset: offset, type: type};
		type = constants.type.minute;
		offset = dateDiff(type, date1, date2);
		if(offset!==0)return {offset: offset, type: type};
		type = constants.type.second;
		offset = dateDiff(type, date1, date2);
		return {offset: offset, type: type};
	}
	
	function dateDiffResultFull(type, date1, date2){
		var result = {};
		var delta = date1.getTime()-date2.getTime();
		var rest = delta;
		switch(type){
		case constants.type.year: 
			result[constants.type.year] = dateDiff(constants.type.year, date1, date2);
			break;
		case constants.type.date: 
			result[constants.type.date] = Math.floor(rest / (1000*60*60*24) );
			rest = rest % (1000*60*60*24);
			result[constants.type.hour] = Math.floor(rest / (1000*60*60) );
			rest = rest % (1000*60*60);
			result[constants.type.minute] = Math.floor(rest / (1000*60) );
			rest = rest % (1000*60);
			result[constants.type.second] = Math.floor(rest / (1000) );
			rest = rest % (1000);
			break;
		}
		return result;
	}
	
	function getOffsetDate(type, date, offset) {
		var year = date.getFullYear();
		var month = date.getMonth();
		var day = date.getDate();
		var hour = date.getHours();
		var minute = date.getMinutes();
		var second = date.getSeconds();
		switch (type) {
		case constants.type.year:year+=offset;break;
		case constants.type.month:month+=offset;break;
		case constants.type.date:day+=offset;break;
		case constants.type.hour:hour+=offset;break;
		case constants.type.minute:minute+=offset;break;
		case constants.type.second:second+=offset;break;
		}
		return paramToDate(year, month, day, hour, minute, second);
	}

	function fillZero(input, num) {
		var result = '' + input;
		for (var i = 0; i < (num - result.length); i++) {
			result = '0' + result;
		}
		return result;
	}
	
	function datetimeToStr(date, fmt) {
		if(typeof date==='string')date = strToDate(date);
		fmt = fmt||'yyyy-MM-dd hh:mm:ss';
		var year = date.getFullYear();
		var month = fillZero(date.getMonth() + 1, 2);
		var dateString = fillZero(date.getDate(), 2);
		var hour = fillZero(date.getHours() ,2);
		var minute = fillZero(date.getMinutes(), 2);
		var second = fillZero(date.getSeconds(), 2);
		return  fmt.replace('yyyy',year).replace('y',date.getFullYear())
			.replace('MM',month).replace('M',date.getMonth() + 1)
			.replace('dd', dateString).replace('d',date.getDate())
			.replace('hh',hour).replace('h',date.getHours())
			.replace('mm',minute).replace('m',date.getMinutes())
			.replace('ss', second).replace('s',date.getSeconds());
	}
	
	function dateToStr(date, fmt) {
		if(typeof date==='string')date = strToDate(date);
		fmt = fmt||'yyyy-MM-dd';
		var year = date.getFullYear();
		var month = fillZero(date.getMonth() + 1, 2);
		var dateString = fillZero(date.getDate(), 2);
		return fmt.replace('yyyy',year).replace('y',date.getFullYear())
			.replace('MM',month).replace('M',date.getMonth() + 1)
			.replace('dd', dateString).replace('d',date.getDate());
	}
	
	function timeToStr(date, fmt){
		if(typeof date==='string')date = strToDate(date);
		fmt = fmt||'hh:mm:ss';
		var hour = fillZero(date.getHours() ,2);
		var minute = fillZero(date.getMinutes(), 2);
		var second = fillZero(date.getSeconds(), 2);
		return fmt.replace('hh',hour).replace('h',date.getHours())
			.replace('mm',minute).replace('m',date.getMinutes())
			.replace('ss', second).replace('s',date.getSeconds());
	}
	
	function durationToStr(millisecond, fmt, fillType){
		fmt = fmt||'hh:mm:ss.ms';
		fillType = fillType||'hh';
		var obj = durationToObj(millisecond);
		var hour = fillZero(obj[constants.type.hour] ,2);
		var minute = fillZero(obj[constants.type.minute], 2);
		var second = fillZero(obj[constants.type.second], 2);
		if(fillType==='hh'||fillType==='mm'&&obj[constants.type.hour]===0){
			fmt = fmt.replace('hh:', '');
			if(fillType==='mm'&&obj[constants.type.minute]===0){
				fmt = fmt.replace('mm:', '');
			}
		}
		return fmt.replace('hh', hour).replace('mm', minute).replace('ss', second).replace('ms', obj[constants.type.millisecond]);
	}
	
	function durationToObj(millisecond){
		var result = {};
		var rest = millisecond;
		result[constants.type.hour] = Math.floor(rest / (1000*60*60) );
		rest = rest % (1000*60*60);
		result[constants.type.minute] = Math.floor(rest / (1000*60) );
		rest = rest % (1000*60);
		result[constants.type.second] = Math.floor(rest / (1000) );
		rest = rest % (1000);
		result[constants.type.millisecond] = rest;
		return result;
	}

	function zhDateToStr(date, fmt){
		if(typeof date==='string')date = strToDate(date);
		fmt = fmt||'yyyyMMdd';
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var dateString = date.getDate();
		return fmt.replace('yyyy',year+'年').replace('MM',month+'月').replace('dd', dateString+'日');
	}
	function zhDatetimeToStr(date){
		var now = new Date();
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var dateString = date.getDate();
		var hour = fillZero(date.getHours() ,2);
		var minute = fillZero(date.getMinutes(), 2);
		var result = '';
		if(now.getFullYear()===year&&now.getMonth()+1===month){
			if(now.getDate()-dateString===0){
				
			}else if(now.getDate()-dateString===1){
				result += '昨天';
			}else if(now.getDate()-dateString===2){
				result += '前天';
			}else{
				result += zhDateToStr(date);
			}
			if(now.getDate()-dateString!==0)result += ' ';
		}
		result += hour+':'+minute;
		return result;
	}
	
	// 微信客户端不支持new Date("2015-07-04 12:00:00")
	function strToDate(dateTimeStr) {
		if(!dateTimeStr)return null;
		var date = new Date(0);
		var dateTimeArray = dateTimeStr.split(' ');
		var dateStr = dateTimeArray[0];
		var dateArray = dateStr.split('-');
		date.setFullYear(parseInt(dateArray[0]));
		date.setMonth(parseInt(dateArray[1]) - 1);
		date.setDate(parseInt(dateArray[2]));
		if (dateTimeArray.length > 1) {
			var timeStr = dateTimeArray[1];
			var timeArray = timeStr.split(':');
			date.setHours(parseInt(timeArray[0]));
			date.setMinutes(parseInt(timeArray[1]));
			date.setSeconds(parseInt(timeArray[2]));
		}
		return date;
	}

	function paramToDate(year, month, date, hour, minute, second) {
		month =month || 0;
		date = date!==undefined? date : 1;
		hour = hour || 0;
		minute = minute || 0;
		second = second || 0;
		var result = new Date(0);
		result.setFullYear(year);
		result.setMonth(month);
		result.setDate(date);
		result.setHours(hour);
		result.setMinutes(minute);
		result.setSeconds(second);
		return result;
	}
	
	function weekdayToStr(weekday){
		var result = '';
		switch(weekday){
		case 0:result='日';break;
		case 1:result='一';break;
		case 2:result='二';break;
		case 3:result='三';break;
		case 4:result='四';break;
		case 5:result='五';break;
		case 6:result='六';break;
		}
		return result;
	}
	
	function typeToStr(type){
		return type.getStr();
	}
	
	function getConstants(){
		function getDateUnitTypes(){
			function DateUnitType(key, value, str){
				this.key = key;
				this.value = value;
				this.str = str;
			}
			DateUnitType.prototype.toString = function(){ return this.value; };
			DateUnitType.prototype.valueOf = function(){ return this.value; };
			DateUnitType.prototype.getStr = function(){ return this.str; };
			function DateUnitTypeManager(){
				Array.call(this);
			} 
			DateUnitTypeManager.prototype = typeof Object.create === "function" ? Object.create(Array.prototype):new Array();
			DateUnitTypeManager.prototype.constructor = DateUnitTypeManager;
			DateUnitTypeManager.prototype.setType = function(type){ 
				var self = this;
				var index = self.indexOf(type);
				if(index>=0){
					self[index] = type;
				}else{
					self.push(type);
				}
				self[type.key] = type;
			};
			DateUnitTypeManager.prototype.getIndex = function(type){ 
				var self = this;
				var key = typeof type === 'string'?type:type.key;
				var i = 0;
				for(;i<self.length;i++){
					if(self[i].key===key)return i;
				}
				return -1;
			};
			DateUnitTypeManager.prototype.compare = function( type1, type2 ){
				return this.getIndex(type1) - this.getIndex(type2);
			}
			
			var dateUnitTypeManager = new DateUnitTypeManager();
			dateUnitTypeManager.setType(new DateUnitType('millisecond', 'millisecond', '毫秒'));
			dateUnitTypeManager.setType(new DateUnitType('second', 'second', '秒'));
			dateUnitTypeManager.setType(new DateUnitType('minute', 'minute', '分钟'));
			dateUnitTypeManager.setType(new DateUnitType('hour', 'hour', '小时'));
			dateUnitTypeManager.setType(new DateUnitType('date', 'date', '天'));
			dateUnitTypeManager.setType(new DateUnitType('day', 'day', '天'));
			dateUnitTypeManager.setType(new DateUnitType('week', 'week', '周'));
			dateUnitTypeManager.setType(new DateUnitType('month', 'month', '月'));
			dateUnitTypeManager.setType(new DateUnitType('calendarMonth', 'calendarMonth', '月'));
			dateUnitTypeManager.setType(new DateUnitType('year', 'year', '年'));
			return dateUnitTypeManager;
		}
		
		return {
			type: getDateUnitTypes()
		}
	}
};
