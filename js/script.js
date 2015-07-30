var graph3d = (function() {
	'use strict';

	var SvgHeight = 500; //высота полотна
	var SvgWidth = 800; //ширина полотна

	var currx = 0; //поворот по х в градусах
	var curry = 0; //поворот по у
	var currz = 0; //поворот по з

	var shiftx = -150;
	var shifty = 100;
	var shiftz = 0;

	var mousePosX = 0;
	var mousePosY = 0;
	var isDown = false;

	var cosA = 1, sinA = 0, cosB = 1, sinB = 0, cosC = 1, sinC = 0;
	var MAXX = 1, MAXY = 1, MAXZ = 1, MINX = 1, MINY = 1, MINZ = 1;
	var ChartShift = 40

	var DZ = 7; //Количество градаций по оси Z
 
	var zoom = 1.3; //значение приближения - отдаления

	var DATA = []; //Данные не тронутые, вытянутые из json
	var Data = []; //Данные, измененные для прорисовки
	
	function toRadians (angle) { return angle * (Math.PI / 180); }
	function Zoom(z) {
		zoom = z;
		RotateScene(currx,curry,currz);
	}
	function Shift(x,y,z) {
		shiftx = x;
		shifty = y;
		shiftz = z;
		RotateScene(currx,curry,currz);
	}
	function Transform(x,y,z) {
		var xmin = 0; var xmax = SvgWidth;
		var ymin = 0; var ymax = SvgHeight;
		var zmin = 0; var zmax = 10;

		var xd = (xmin + xmax)/2;
		var yd = (ymin + ymax)/2;
		var zd = (zmin + zmax)/2;

		var shift = 150;

		var x1 = x*zoom - shift;
		var y1 = -y*zoom ;
		var z1 = z*zoom - shift;

		var x2 = x1*cosC - y1*sinC + z1*0;
		var y2 = x1*sinC + y1*cosC + z1*0;
		var z2 = x1*0 + y1*0 + z1;

		var x3 = x2*cosB - y2*0 - z2*sinB;
		var y3 = x2*0 + y2*1 + z2*0;
		var z3 = x2*sinB + y2*0 + z2*cosB;

		var x4 = x3 + y3*0 + z3*0;
		var y4 = x3*0 + cosA*y3 - sinA*z3;
		var z4 = x3*0 + sinA*y3 + cosA*z3;



		return [x4 + xd + shiftx + shift, y4 + yd + shifty, z4 + shiftz + shift];
	}
	function ColorFunction(y) {
		var c=d3.hsl( y, 0.5, 0.5).rgb();
		return ("rgb("+parseInt(c.r)+","+parseInt(c.g)+","+parseInt(c.b)+")")
	}
	function DrawAxis() {	
		var svg = d3.select('#d3container')
				.append('svg')
				.attr('id','GraphSvg')
				.attr('height',SvgHeight)
				.attr('width',SvgWidth)

		document.getElementById("d3container").addEventListener("mousemove", function(e){
			e.preventDefault();
			if (isDown) {//Поворот мышью
				var dx = (mousePosX - e.clientX)/2;
				var dy = (mousePosY - e.clientY)/2;

				RotateScene(dy,dx,0)

				mousePosX = e.clientX;
				mousePosY = e.clientY;
			}
		})
		document.getElementById("d3container").addEventListener("mouseup", function(e) {
				isDown = false;
			}
		)
		document.getElementById("d3container").addEventListener("mousedown", function(e) {
				mousePosX = e.clientX;
				mousePosY = e.clientY;
				isDown = true;
			}
		)
	}
	function DrawPoint(x,y,z,rr) {
		var p = Transform(x,y,z);
		var svg = d3.select('#GraphSvg')
		var ret = 	svg.append('circle')
			.attr('cx',p[0])
			.attr('cy',p[1])
			.attr('x1',x)
			.attr('y1',y)
			.attr('z1',z)
			.attr('class','point')
			.attr('fill','yellow')
			.attr('r',5)

			.on('mouseover',function() {
				console.log(this.getAttribute('x1') +' '+ this.getAttribute('y1') + ' ' + this.getAttribute('z1'));
			})
		if (rr == 'real')
		{
			ret.attr('fill',ColorFunction(y))
				.attr('real','real')
		}
		else
		{
			ret.attr('fill','yellow')
				.attr('real','unreal')
		}
		return ret;
	}
	/**
	 * рисование линии при наведении на которую будет отображатся ее проекция
	 * @param {[array[][][] ]} points [точки по которым строится линия]
	 * @param {[string]} ID [lineOZ или lineOX]
	 */
	function DrawLine(points,ID) {
		var d = '';	var d1 = '';
		var p;	var pt;
		for (var i = 0; i < points.length; i += 1) {
			p = [ points[i][0], points[i][1], points[i][2] ];
			pt = Transform( p[0],p[1],p[2]);
			if (i == 0)
				d = 'M';
			else
				d += 'L';
				d += pt[0] + ' ' + pt[1];
			d1 += p[0] + ' ' + p[1] + ' ' + p[2] + ' '; 
		}
		var svg = d3.select('#GraphSvg');
		var line =	svg.append('path')
			.attr('d',d)
			.attr('stroke','black')
			.attr('stroke-width',7)
			.attr('stroke-opacity',0)
			.attr('points', d1.trim() )
			.attr('class', 'line')
			.attr('fill','none')
		if (ID == 'LineOX')	{
			line.on('mouseover', function(){
				this.setAttribute('stroke', 'yellow');
				this.setAttribute('stroke-opacity', 1)
				//DrawGraphic(this)
			})
			.on('mouseout', function(){
				this.setAttribute('stroke-opacity', 0)
			})
			.on('click', function(){
				DrawGraphic(this)
			})
		}
		if (ID == 'LineOZ')	{
			line.on('mouseover', function(){
				this.setAttribute('stroke', 'blue');
				this.setAttribute('stroke-opacity', 1)
			})
			.on('mouseout', function(){
				this.setAttribute('stroke-opacity', 0)
			})
			.on('click', function(){
				DrawGraphic(this)
			})
		}
			line.attr('id',ID)
	}
	function DrawPolygon(points,cl)	{
		var d = '';	var d1 = '';
		var p;	var pt;
		points.push(points[0]);
		var maxy = 0;
		for (var i = 0; i < points.length; i += 1) {
			p = [ points[i][0], points[i][1], points[i][2] ];
			pt = Transform( p[0],p[1],p[2]);
			if (i == 0)
				d = 'M';
			else
				d += 'L';
				d += pt[0] + ' ' + pt[1];
			d1 += p[0] + ' ' + p[1] + ' ' + p[2] + ' ';

			if (maxy < points[i][1])
				maxy =  points[i][1];
		}

		var svg = d3.select('#GraphSvg');            

		var ret = svg.append('path')
			.attr('d',d)
			.attr('stroke','black')
			.attr('points', d1.trim() )
			.attr('class', cl)
			.attr('fill',ColorFunction(maxy))
			.attr('fill-opacity',0.7)
		return ret;
	}
	function DrawCharts() {
		var svg = DrawPolygon([[MINX,MINY,MINZ-ChartShift],[MAXX,MINY,MINZ-ChartShift],[MAXX,MAXY,MINZ-ChartShift],[MINX,MAXY,MINZ-ChartShift]],'chart');			
		svg.attr('id', 'chartOX');
		svg.attr('fill','grey');
		svg.append('path');
		svg = DrawPolygon([[MINX,MINY-ChartShift,MINZ],[MAXX,MINY-ChartShift,MINZ],[MAXX,MINY-ChartShift,MAXZ],[MINX,MINY-ChartShift,MAXZ]],'chart');
		svg.attr('id', 'chartOZ');
		svg.attr('fill','grey');
		svg = DrawPolygon([[MINX-ChartShift,MINY,MINZ],[MINX-ChartShift,MINY,MAXZ],[MINX-ChartShift,MAXY,MAXZ],[MINX-ChartShift,MAXY,MINZ]],'chart');
		svg.attr('id', 'chartOY');
		svg.attr('fill','grey');

		//создание линий, которые будут проекциями на чарты
		var p = [Transform(MINX,MINY,MINZ-ChartShift),Transform(MINX,MINY,MINZ-ChartShift)]
		var points = ''+MINX+' '+MINY+' '+(MINZ-ChartShift)+' '+MINX+' '+MINY+' '+(MINZ-ChartShift);
		var svg = d3.select('#GraphSvg');
			  svg.append('path')
				.attr('d','M'+p[0][0]+' '+p[0][1]+'L'+p[1][0]+' '+p[1][1])
				.attr('stroke','black')
				.attr('stroke-width',1)
				.attr('points', points)
				.attr('id', 'GraphOZ')
				.attr('fill','none')
				.attr('class','line')
			svg.append('path')
				.attr('d','M'+p[0][0]+' '+p[0][1]+'L'+p[1][0]+' '+p[1][1])
				.attr('stroke','black')
				.attr('stroke-width',1)
				.attr('points', points)
				.attr('id', 'GraphOX')
				.attr('fill','none')
				.attr('class','line')
			svg.append('path')
				.attr('d','M'+p[0][0]+' '+p[0][1]+'L'+p[1][0]+' '+p[1][1])
				.attr('stroke','black')
				.attr('stroke-width',1)
				.attr('points', points)
				.attr('id', 'GraphOY')
				.attr('fill','none')
				.attr('class','line')
	}
	function RotatePoints() {
		var svg = d3.select('#GraphSvg');
		var points = GraphSvg.getElementsByClassName('point');
		for (var i = 0; i < points.length; i += 1) {			
			var a = points[i];
			var p = Transform(a.getAttribute('x1'),a.getAttribute('y1'),a.getAttribute('z1'));
			a.setAttribute('cx',p[0]) ;
			a.setAttribute('cy',p[1]) ;
		}
	}
	function RotateLines() {
		var svg = d3.select('svg');
		var lines = GraphSvg.getElementsByClassName('line');
		for (var i = 0; i < lines.length; i += 1)
		{			
			var a = lines[i];
			var points = a.getAttribute('points').trim().split(' ');
			var d = '';
			for (var j = 0; j < points.length; j += 3) {
				var p = Transform(points[j],points[j+1],points[j+2])
				
				if (j == 0)
					d = 'M';
				else
					d += 'L';
				d += p[0] + ' ' + p[1];
			}
			a.setAttribute('d', d);
		}
	}
	function RotatePolygons() {
		var svg = d3.select('svg');
		var lines = GraphSvg.getElementsByClassName('polygon');
		for (var i = 0; i < lines.length; i += 1)
		{	
			var a;
			if (Math.sin(toRadians(curry)) > 0)
				var a = lines[i];
			else
				var a = lines[lines.length-i-1];

			var points = a.getAttribute('points').split(' ');
			a = lines[i];
			var d = '';
			var MaxY = 0;
			for (var j = 0; j < points.length; j += 3) {
				var p = Transform(points[j],points[j+1],points[j+2])
				
				if (j == 0)
					d = 'M';
				else
					d += 'L';
				d += p[0] + ' ' + p[1];

				if (points[j+2] > MaxY)
					MaxY = points[j+1];
			}
			a.setAttribute('d', d);
			a.setAttribute('fill',ColorFunction(MaxY))	
		}
	}
	function DrawGraphic(obj) {
		if (obj.id == 'LineOZ')
		{
			var points = obj.getAttribute('points').split(' ');
			var graph = document.getElementById('GraphOZ')
			var d = '';
			var d1 = '';
			var p;	var pt;
			for (var i = 0; i < points.length; i += 3) {
				if (sinB > 0)
					p = [ MINX - ChartShift, points[i+1], points[i+2] ];
				else
					p = [ MAXX + ChartShift, points[i+1], points[i+2] ];
				pt = Transform( p[0],p[1],p[2]);
				if (i == 0)
					d = 'M';
				else
					d += 'L';
					d += pt[0] + ' ' + pt[1];
				d1 += p[0] + ' ' + p[1] + ' ' + p[2] + ' '; 
			}
			graph.setAttribute('d',d);
			graph.setAttribute('points', d1.trim());
			graph.setAttribute('stroke', 'blue')
		}
		if (obj.id == 'LineOX')
		{
			var points = obj.getAttribute('points').split(' ');
			var graph = document.getElementById('GraphOX')
			var d = '';
			var d1 = '';
			var p;	var pt;
			for (var i = 0; i < points.length; i += 3) {
				if (cosB > 0)
					p = [ points[i], points[i+1], MINZ - ChartShift ];
				else
					p = [ points[i], points[i+1], MAXZ + ChartShift ];
				pt = Transform( p[0],p[1],p[2]);
				if (i == 0)
					d = 'M';
				else
					d += 'L';
					d += pt[0] + ' ' + pt[1];
				d1 += p[0] + ' ' + p[1] + ' ' + p[2] + ' '; 
			}
			graph.setAttribute('d',d);
			graph.setAttribute('points', d1.trim());
			graph.setAttribute('stroke', 'yellow')
		}
	}
	function RotateCharts()	{
		var Chart;
		var p;
		
		Chart = d3.select('#chartOX');
		if (Math.cos(toRadians(curry)) > 0)
			p = [Transform(MINX,MINY,MINZ-ChartShift),Transform(MAXX,MINY,MINZ-ChartShift),Transform(MAXX,MAXY,MINZ-ChartShift),Transform(MINX,MAXY,MINZ-ChartShift)];
		else
			p = [Transform(MINX,MINY,MAXZ+ChartShift),Transform(MAXX,MINY,MAXZ+ChartShift),Transform(MAXX,MAXY,MAXZ+ChartShift),Transform(MINX,MAXY,MAXZ+ChartShift)];
		Chart.attr('d','M'+p[0][0]+' '+p[0][1]+'L'+p[1][0]+' '+p[1][1]+'L'+p[2][0]+' '+p[2][1]+'L'+p[3][0]+' '+p[3][1]+'L'+p[0][0]+' '+p[0][1]);
		
		Chart = d3.select('#chartOY');
		if (Math.sin(toRadians(curry)) > 0)
			p = [Transform(MINX-ChartShift,MINY,MINZ),Transform(MINX-ChartShift,MINY,MAXZ),Transform(MINX-ChartShift,MAXY,MAXZ),Transform(MINX-ChartShift,MAXY,MINZ)];
		else
			p = [Transform(MAXX+ChartShift,MINY,MINZ),Transform(MAXX+ChartShift,MINY,MAXZ),Transform(MAXX+ChartShift,MAXY,MAXZ),Transform(MAXX+ChartShift,MAXY,MINZ)];
		Chart.attr('d','M'+p[0][0]+' '+p[0][1]+'L'+p[1][0]+' '+p[1][1]+'L'+p[2][0]+' '+p[2][1]+'L'+p[3][0]+' '+p[3][1]+'L'+p[0][0]+' '+p[0][1]);

		Chart =  d3.select('#chartOZ');
		p = [Transform(MINX,MINY-ChartShift,MINZ),Transform(MAXX,MINY-ChartShift,MINZ),Transform(MAXX,MINY-ChartShift,MAXZ),Transform(MINX,MINY-ChartShift,MAXZ)];
		Chart.attr('d','M'+p[0][0]+' '+p[0][1]+'L'+p[1][0]+' '+p[1][1]+'L'+p[2][0]+' '+p[2][1]+'L'+p[3][0]+' '+p[3][1]+'L'+p[0][0]+' '+p[0][1]);
		
		var Graph = d3.select('#GraphOX');
		p = Graph.attr('points').split(' ');
		var points = '';
		if (cosB > 0)
			for (var i = 2; i < p.length; i +=3 )
				p[i] = MINZ - ChartShift;
		else
			for (var i = 2; i < p.length; i +=3 )
				p[i] = MAXZ + ChartShift;
		for (var i = 0; i < p.length; i +=1 )
			points += p[i]+' ';
		Graph.attr('points',points.trim());

		Graph = d3.select('#GraphOZ');
		p = Graph.attr('points').split(' ');
		var points = '';
		if (sinB > 0)
			for (var i = 0; i < p.length; i +=3 )
				p[i] = MINX - ChartShift;
		else
			for (var i = 0; i < p.length; i +=3 )
				p[i] = MAXX + ChartShift;
		for (var i = 0; i < p.length; i +=1 )
			points += p[i]+' ';
		Graph.attr('points',points.trim());
	}
	function RotateScene(rx,ry,rz) {
		if ( (currx >= -90 || rx > 0) && (currx <= 0 || rx < 0) ) // Ограничение на движение по оси OX
			currx = currx + rx;
		
		curry = curry + ry;
		currz = currz + rz;

		var A = toRadians(currx); var B = toRadians(curry); var C = toRadians(currz);
		cosA = Math.cos(A);		sinA = Math.sin(A);
		cosB = Math.cos(B);		sinB = Math.sin(B);
		cosC = Math.cos(C);		sinC = Math.sin(C);
		
		RotateCharts();
		RotatePolygons();
		RotateLines();
		RotatePoints();
	}
	function TransformData(arg) {

		arg.forEach(function(subArray) {
			var b = [];
			subArray.forEach(function(subsubArray) {
				b.push(subsubArray);
			})
			DATA.push(b);
		})

		var Dates = [];
		for (var i = 0; i < arg.length; i += 1)	{
			Dates[i] = arg[i][0];
			arg[i][2] = arg[i][2]*3;
		}
		
		var i = Dates.length;
		Dates.sort();
		while (i--) //Удаление повторяющихся дат
	    	if (Dates[i] == Dates[i-1])
	        	Dates.splice(i, 1);
		
		var d = [];
		
		for (var k = 0; k < Dates.length; k += 1 )// распределение выборки по датам
			d[k] = arg.filter( function(item){ if (item[0] == Dates[k]) return item; })


		
		var MinZ = d[0][0][2]; var MaxZ = d[0][0][2];//нахождение максимального и минимального значения Z в выборке
		for (var k = 0; k < d.length; k += 1)
			for (var j = 0; j < d[k].length; j+=1) {
				if (d[k][j][2] > MaxZ)	MaxZ = d[k][j][2]
				if (d[k][j][2] < MinZ)	MinZ = d[k][j][2]				
			}

		for (var i = 0; i < d.length; i += 1) {//Выравнивание данных по оси OZ
			var dz = (MaxZ - MinZ)/(d[i].length -1 ) ;
			for (var j = 0; j < d[i].length; j += 1)
				d[i][j][2] = MinZ + j*dz;
		}

		var dd1 = [];
		var DZ = 6;
		var dz = (MaxZ - MinZ)/DZ;
		for (var i = 0; i < d.length; i += 1) {
			var dd2 = [];
			for (var j = 0; j < DZ; j += 1) {
				var corel = 100;
				var Index = 0;
				for (var k = 0; k < d[i].length; k += 1) {
					var CurCorel =  Math.abs((d[i][k][2] - MinZ) - dz*j);
					if (CurCorel < corel) {
						corel = CurCorel;
						Index = k;
					}
				}
				var p = d[i][Index];
				p[2] = MinZ + dz*j;
				dd2.push(p);
			}
			dd2 = dd2;
			dd1.push(dd2);
		}
		Data = dd1;
		
		MAXX = Data[0][0][0]; MAXY = Data[0][0][1]; MAXZ = Data[0][0][2];
		MINX = MAXX; MINY = MAXY; MINZ = MAXZ;
		
		for (var i = 0; i < Data.length; i += 1)
			for (var j = 0; j < Data[i].length; j += 1) {
				if ( MAXX < Data[i][j][0])	MAXX = Data[i][j][0];
				if ( MINX > Data[i][j][0])	MINX = Data[i][j][0];

				if ( MAXY < Data[i][j][1])	MAXY = Data[i][j][1];
				if ( MINY > Data[i][j][1])	MINY = Data[i][j][1];

				if ( MAXZ < Data[i][j][2])	MAXZ = Data[i][j][2];
				if ( MINZ > Data[i][j][2])	MINZ = Data[i][j][2];
			}
	}
	function TransformData1(arg) {
		arg.forEach(function(subArray) {
			var b = [];
			subArray.forEach(function(subsubArray) {
				b.push(subsubArray);
			})
			DATA.push(b);
		})

		var Dates = [];
		for (var i = 0; i < arg.length; i += 1)	{
			Dates[i] = arg[i][0];
			arg[i][2] = arg[i][2]*3;
		}
		
		var i = Dates.length;
		Dates.sort();
		while (i--) //Удаление повторяющихся дат
	    	if (Dates[i] == Dates[i-1])
	        	Dates.splice(i, 1);
		
		var d = [];
		
		for (var k = 0; k < Dates.length; k += 1 )// распределение выборки по датам
			d[k] = arg.filter( function(item){ if (item[0] == Dates[k]) return item; });
		for (var k = 0; k < Dates.length; k += 1 )// массивов по оси Z
			d[k] = d[k].sort( function(a,b){return a[2] - b[2]});

		
		var MinZ = d[0][0][2]; var MaxZ = d[0][0][2];//нахождение максимального и минимального значения Z в выборке
		for (var k = 0; k < d.length; k += 1)
			for (var j = 0; j < d[k].length; j+=1) {
				if (d[k][j][2] > MaxZ)	MaxZ = d[k][j][2]
				if (d[k][j][2] < MinZ)	MinZ = d[k][j][2]				
			}
		console.log(MaxZ+' '+MinZ);

		var dd = [];
		var Dz = (MaxZ - MinZ)/DZ;
		var corell = 100;

		for (var i = 0; i < d.length; i += 1) {
			var ddd = [];
			for (var k = 0; k <= DZ; k +=1) {
				var MinCorell = 100;
				var index;
				var CurCorell;
				for (var j = 0; j < d[i].length; j += 1) {
					CurCorell = Math.abs( (d[i][j][2] - MinZ) - Dz*k )
					if (CurCorell < MinCorell) {
						MinCorell = CurCorell;
						index = j;
					}
				}
				if ( (d[i][index][2] - MinZ) == Dz*k) {
					var p = [d[i][index][0],d[i][index][1],d[i][index][2],'real']
					ddd.push(p);	
				}
				else
					if ( Dz*k > (d[i][index][2] - MinZ) && (index == (d[i].length - 1)) ) {
						var dz1 = d[i][index][2] - d[i][index-1][2];
						var dy1 = d[i][index][1] - d[i][index-1][1];

						var dz2 = Dz*k - d[i][index-1][2];
						var dy2 = (dy1*dz2)/dz1;

						var p = [ d[i][index-1][0], d[i][index-1][1] + dy2, Dz*k + MinZ, 'unreal'];
						ddd.push(p)
					}
					else
					if ( Dz*k < (d[i][index][2] - MinZ) && (index == 0) ) {
						var z3 = d[i][index+1][2];
						var y3 = d[i][index+1][1];

						var z2 = d[i][index][2];
						var y2 = d[i][index][1];

						var kk = (y3-y2)/(z3-z2)

						var z1 = Dz*k + MinZ;
						var y1 = y2 - kk*(z2-z1);

						var p =[ d[i][index][0], y1, z1, 'unreal'];
						ddd.push(p);
					}
					else
						if ( Dz*k < (d[i][index][2] - MinZ) && (index > 0)) {
							var dz = d[i][index][2] - d[i][index-1][2];
							var dy = d[i][index][1] - d[i][index-1][1];

							var z1 = Dz*k - d[i][index-1][2];
							var y1 = d[i][index-1][1] + (z1*dy)/dz;

							var p = [ d[i][index-1][0], y1, Dz*k + MinZ, 'real'];
							ddd.push(p)
						}
						else
							if ( Dz*k > (d[i][index][2] - MinZ) && (index < d[i].length -1)) {
								var dz = d[i][index+1][2] - d[i][index][2];
								var dy = d[i][index+1][1] - d[i][index][1];

								var z1 = Dz*k - d[i][index][2];
								var y1 = d[i][index][1] + (z1*dy)/dz;

								var p = [ d[i][index-1][0], y1, Dz*k + MinZ, 'real'];
								ddd.push(p)
							}
			}
			dd.push(ddd);
		}
		Data = dd;

		MAXX = Data[0][0][0]; MAXY = Data[0][0][1]; MAXZ = Data[0][0][2];
		MINX = MAXX; MINY = MAXY; MINZ = MAXZ;
		
		for (var i = 0; i < Data.length; i += 1)
			for (var j = 0; j < Data[i].length; j += 1) {
				if ( MAXX < Data[i][j][0])	MAXX = Data[i][j][0];
				if ( MINX > Data[i][j][0])	MINX = Data[i][j][0];

				if ( MAXY < Data[i][j][1])	MAXY = Data[i][j][1];
				if ( MINY > Data[i][j][1])	MINY = Data[i][j][1];

				if ( MAXZ < Data[i][j][2])	MAXZ = Data[i][j][2];
				if ( MINZ > Data[i][j][2])	MINZ = Data[i][j][2];
			}
	}
	function DrawData() {
		for (var i = 1; i < Data.length; i += 1)
			for (var j = 1; j < Data[i].length; j +=1 )
				DrawPolygon([ Data[i][j],Data[i][j-1],Data[i-1][j-1],Data[i-1][j]  ],'polygon');
		
		for (var i = 0; i < Data.length; i += 1)
			DrawLine(Data[i],'LineOZ');
				
		for (var i = 0; i < Data[0].length; i += 1)	{
			var p = [];
			for (var j = 0; j < Data.length; j += 1)
				p.push(Data[j][i]);
			DrawLine(p,'LineOX');
		}
		for (var i = 0; i < Data.length; i += 1)
			for (var j = 0; j < Data[i].length; j += 1)
				DrawPoint(Data[i][j][0],Data[i][j][1],Data[i][j][2],Data[i][j][3]);
	}
	function DrawRealData() {
		for (var i = 0; i < DATA.length; i+=1)
			DrawPoint(DATA[i][0],DATA[i][1],DATA[i][2]*3)
	}
	function GetData(url) {
		var a = document.getElementById('d3container');
		if (a != null) {
			DATA = [];
			Data = [];
			a.innerHTML = '';
		}

		$.getJSON( url, function( data ) {
			var d = [];
			var maxD = 0;
			for (var i = 0; i < data.length; i += 1) {
				var text = data[i].expiration;
				var date = new Date(text.replace(/(\d+)-(\d+)-(\d+)/, '$2/$3/$1'));

				if (date > maxD || i == 0)
					maxD = date;

				d.push([date, data[i].implied_volatility, data[i].moneyness]);
			}

			for (var i = 0; i < d.length; i += 1 ) {
				d[i][0] =  ((maxD - d[i][0])/(1000*3600*24)).toFixed(0)/1;
				d[i][1] = d[i][1]/1;
			}

			graph3d.DrawAxis();
			graph3d.TransformData1(d);
			//graph3d.TransformData(d);
			graph3d.DrawCharts();
			graph3d.DrawData();
			//graph3d.DrawRealData();
			//graph3d.DrawPoint(0,0,0);
			console.log(MAXX);
		});
	}

	
	return {
		//public
		DrawAxis:DrawAxis,
		DrawPoint:DrawPoint,
		RotateScene:RotateScene,
		DrawLine:DrawLine,
		DrawPolygon:DrawPolygon,
		Zoom:Zoom,
		Shift:Shift,
		TransformData:TransformData,
		DrawCharts:DrawCharts,
		DrawData:DrawData,
		DrawRealData:DrawRealData,
		GetData:GetData,
		TransformData1:TransformData1
	};
}());

graph3d.GetData('js/puts1.json');