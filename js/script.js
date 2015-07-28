var graph3d = (function() {
	'use strict';

	var SvgHeight = 500; //высота полотна
	var SvgWidth = 500; //ширина полотна

	var currx = 0; //поворот по х в градусах
	var curry = 0; //поворот по у
	var currz = 0; //поворот по з

	var shiftx = -150;
	var shifty = 100;
	var shiftz = 0;

	var mousePosX = 0;
	var mousePosY = 0;
	var isDown = false;

	var cosA, sinA, cosB, sinB, cosC, sinC; 
 
	var zoom = 1.3; //значение приближения - отдаления

	var DATA = []; //Данные не тронутые, вытянутые json
	var Data = []; //Данные, измененные для прорисовки
	
	function toRadians (angle)	{ return angle * (Math.PI / 180); }
	function Zoom(z)
	{
		zoom = z;
		RotateScene(currx,curry,currz);
	}
	function Shift(x,y,z)
	{
		shiftx = x;
		shifty = y;
		shiftz = z;
		RotateScene(currx,curry,currz);
	}
	function Transform(x,y,z)
	{
		var xmin = 0; var xmax = SvgHeight;
		var ymin = 0; var ymax = SvgWidth;
		var zmin = 0; var zmax = 10;

		var xd = (xmin + xmax)/2;
		var yd = (ymin + ymax)/2;
		var zd = (zmin + zmax)/2;

		var shift = 150;

		var x1 = x*zoom - shift;
		var y1 = -y*zoom ;
		var z1 = z*zoom - shift ;

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
	function ColorFunction(y)
	{
		var c=d3.hsl( y*1.5, 0.5, 0.5).rgb();
		return ("rgb("+parseInt(c.r)+","+parseInt(c.g)+","+parseInt(c.b)+")")
	}
	function DrawAxis()
	{
		var c = [0,0,0];
		var c1 = Transform(0,0,0); 
		
		var p1 = [250,0,0];
		var p2 = [0,250,0];
		var p3 = [0,0,250];

		var p1t = Transform(p1[0],p1[1],p1[2]);
		var p2t = Transform(p2[0],p2[1],p2[2]);
		var p3t = Transform(p3[0],p3[1],p3[2]);

		var svg = d3.select('#d3container')
				.append('svg')
				.attr('id','GraphSvg')
				.attr('height',SvgHeight)
				.attr('width',SvgWidth)

		svg.append('path')
			.attr('d','M'+c1[0]+' '+c1[1]+'L'+p1t[0]+' '+p1t[1])
			.attr('stroke','blue')
			.attr('points', ''+c[0]+' '+c[1]+' '+c[2]+' '+p1[0]+' '+p1[1]+' '+p1[2])
			.attr('class', 'line')
			
		svg.append('path')
			.attr('d','M'+c1[0]+' '+c1[1]+'L'+p2t[0]+' '+p2t[1])
			.attr('stroke','green')
			.attr('points', ''+c[0]+' '+c[1]+' '+c[2]+' '+p2[0]+' '+p2[1]+' '+p2[2])
			.attr('class', 'line')

		svg.append('path')
			.attr('d','M'+c1[0]+' '+c1[1]+'L'+p3t[0]+' '+p3t[1])
			.attr('stroke','red')
			.attr('points', ''+c[0]+' '+c[1]+' '+c[2]+' '+p3[0]+' '+p3[1]+' '+p3[2])
			.attr('class', 'line')
	
		document.getElementById("d3container").addEventListener("mousemove", function(e){
			e.preventDefault();
			if (isDown)
			{
				var dx = (mousePosX - e.clientX)/2;
				var dy = (mousePosY - e.clientY)/2;

				RotateScene(dy,dx,0)

				mousePosX = e.clientX;
				mousePosY = e.clientY;
			}
		})
		document.getElementById("d3container").addEventListener("mouseup", function(e){
				isDown = false;
			}
		)
		document.getElementById("d3container").addEventListener("mousedown", function(e){
				mousePosX = e.clientX;
				mousePosY = e.clientY;
				isDown = true;
			}
		)
	}
	function DrawPoint(x,y,z)
	{
		var p = Transform(x,y,z);
		var svg = d3.select('#GraphSvg')
			.append('circle')
			.attr('cx',p[0])
			.attr('cy',p[1])
			.attr('x1',x)
			.attr('y1',y)
			.attr('z1',z)
			.attr('class','point')
			.attr('fill','yellow')
			.attr('r',5)
			.attr('fill',ColorFunction(y))
			.on('mouseover',function(){
				console.log(this.getAttribute('x1') +' '+ this.getAttribute('y1') + ' ' + this.getAttribute('z1'));
			})
	}
	function DrawLine(points)
	{
		var d = '';	var d1 = '';
		var p;	var pt;
		for (var i = 0; i < points.length; i += 1)
		{
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
		svg.append('path')
			.attr('d',d)
			.attr('stroke','black')
			.attr('points', d1.trim() )
			.attr('class', 'line')
			.attr('fill','none')
	}
	function DrawGraphic(points)
	{
		DrawLine(points);
		for (var i = 0; i < points.length; i += 1)
		{
			DrawPoint(points[i][0],points[i][1],points[i][2]);
		}
	}
	function DrawPolygon(points)
	{
		var d = '';	var d1 = '';
		var p;	var pt;
		points.push(points[0]);
		var maxy = 0;
		for (var i = 0; i < points.length; i += 1)
		{
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

		svg.append('path')
			.attr('d',d)
			.attr('stroke','black')
			.attr('points', d1.trim() )
			.attr('class', 'polygon')
			.attr('fill',ColorFunction(maxy))
			.attr('fill-opacity',0.7)
	}
	function DrawCharts()
	{
		/*var d = ''; var d1 = '';
		var p1 = [[0,0,0],[250,0,0],[250,250,0],[0,250,0]];
		for (var i = 0; i < p1.length; i += 1)
		{
			var p = [ p1[i][0], p1[i][1], p1[i][2] ];
			var pt = Transform( p[0],p[1],p[2]);
			if (i == 0)	d = 'M';
			else d += 'L';
				d += pt[0] + ' ' + pt[1];
			d1 += p[0] + ' ' + p[1] + ' ' + p[2] + ' ';
		}

		var svg = d3.select('#GraphSvg');
		svg.append('path')
			.attr('stroke','black')
			.attr('d',d)
			.attr('points',d1)
			.attr('points', d1.trim() )
			.attr('class', 'polygon')
			.attr('fill','red')
			.attr('fill-opacity',0.7)*/
	}
	function RotatePoints()
	{
		var svg = d3.select('#GraphSvg');
		var points = GraphSvg.getElementsByClassName('point');
		for (var i = 0; i < points.length; i += 1)
		{			
			var a = points[i];
			var p = Transform(a.getAttribute('x1'),a.getAttribute('y1'),a.getAttribute('z1'));
			a.setAttribute('cx',p[0]) ;
			a.setAttribute('cy',p[1]) ;
		}
	}
	function RotateLines()
	{
		var svg = d3.select('svg');
		var lines = GraphSvg.getElementsByClassName('line');
		for (var i = 0; i < lines.length; i += 1)
		{			
			var a = lines[i];
			var points = a.getAttribute('points').split(' ');
			var d = '';
			for (var j = 0; j < points.length; j += 3)
			{
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
	function RotatePolygons()
	{
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
			for (var j = 0; j < points.length; j += 3)
			{
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
	function RotateScene(rx,ry,rz)
	{
		if ( (currx >= -90 || rx > 0) && (currx <= 0 || rx < 0) ) // Ограничение на движение по оси OX
			currx = currx + rx;
		
		curry = curry + ry;
		currz = currz + rz;

		var A = toRadians(currx); var B = toRadians(curry); var C = toRadians(currz);
		cosA = Math.cos(A);		sinA = Math.sin(A);
		cosB = Math.cos(B);		sinB = Math.sin(B);
		cosC = Math.cos(C);		sinC = Math.sin(C);
		
		RotatePolygons();
		RotateLines();
		RotatePoints();
	}
	function GetData(d)
	{
		DATA = d;
		var Dates = [];
		for (var i = 0; i < DATA.length; i += 1)
		{
			Dates[i] = DATA[i][0];
			DATA[i][2] = DATA[i][2]*3;
		}
		var i = Dates.length;
		Dates.sort();

		while (i--) //Удаление повторяющихся дат
	    	if (Dates[i] == Dates[i-1])
	        	Dates.splice(i, 1);
		var dd = []

		for (var i = 0; i < Dates.length; i += 1)
			dd[i] = DATA.filter( function(item){ if (item[0] == Dates[i]) return item; })

		var MinZ = dd[0][0][2];
		var MaxZ = dd[0][0][2];
		
		for (var i = 0; i < dd.length; i+=1)
			for (var j = 0; j < dd[i].length; j += 1)
			{
				if (dd[i][j][2] < MinZ)
					MinZ = dd[i][j][2];
				if (dd[i][j][2] > MaxZ)
					MaxZ = dd[i][j][2];
			}
		
		var ZD = 6;
		var Step = (MaxZ - MinZ)/ZD;

		for (var i = 0; i < dd.length-1; i += 1)
		{
			var dd1 = dd[i].sort(function(a,b){return a[2] - b[2]});
			var dd2 = dd[i+1].sort(function(a,b){return a[2] - b[2]});
			dd1[0][2] = MinZ;
			dd1[dd1.length-1][2] = MaxZ;
			dd2[0][2] = MinZ;
			dd2[dd2.length-1][2] = MaxZ;


			var lastIndex1 = 0;
			var lastIndex2 = 0;
			for (var j = 1; j < ZD; j += 1)
			{
				var NearestIndex1 = 0;
				var NearestIndex2 = 0;
				var correll = 100;
				for (var g = 0; g < dd1.length; g += 1)
				{
					var cor = Math.abs( dd1[g][2] - Step*j );
					if (cor < correll)
					{
						NearestIndex1 = g;
						correll = cor;
					}
				}
				correll = 100;
				for (var g = 0; g < dd2.length; g += 1)
				{
					var cor = Math.abs( dd2[g][2] - Step*j );
					if (cor < correll)
					{
						NearestIndex2 = g;
						correll = cor;
					}
				}
				DrawPolygon( [ dd1[lastIndex1],dd1[NearestIndex1],dd2[NearestIndex2],dd2[lastIndex2] ] );
				
				DrawPoint( dd2[NearestIndex2][0],dd2[NearestIndex2][1],dd2[NearestIndex2][2] );
				DrawPoint( dd1[NearestIndex1][0],dd1[NearestIndex1][1],dd1[NearestIndex1][2] );
				//if (j == ZD)
				{
					DrawPoint( dd2[lastIndex2][0],dd2[lastIndex2][1],dd2[lastIndex2][2] );
					DrawPoint( dd1[lastIndex1][0],dd1[lastIndex1][1],dd1[lastIndex1][2] );
				}
				
				lastIndex1 = NearestIndex1;
				lastIndex2 = NearestIndex2;
			}
		}

		var points = GraphSvg.getElementsByClassName('point');
		for (var i = 0; i < points.length; i +=1)
		{
			points[i].parentNode.appendChild(points[i]);
		}
	}
	function TransformData(arg)
	{
		DATA = arg;

		var Dates = [];
		for (var i = 0; i < DATA.length; i += 1)
		{
			Dates[i] = DATA[i][0];
			DATA[i][2] = DATA[i][2]*3;
		}
		
		var i = Dates.length;
		Dates.sort();
		while (i--) //Удаление повторяющихся дат
	    	if (Dates[i] == Dates[i-1])
	        	Dates.splice(i, 1);
		
		var d = [];
		
		for (var k = 0; k < Dates.length; k += 1 )// распределение выборки по датам
			d[k] = DATA.filter( function(item){ if (item[0] == Dates[k]) return item; })


		
		var MinZ = d[0][0][2]; var MaxZ = d[0][0][2];//нахождение максимального и минимального значения Z в выборке
		for (var k = 0; k < d.length; k += 1)
			for (var j = 0; j < d[k].length; j+=1)
			{
				if (d[k][j][2] > MaxZ)	MaxZ = d[k][j][2]
				if (d[k][j][2] < MinZ)	MinZ = d[k][j][2]				
			}

		for (var i = 0; i < d.length; i += 1) //Выравнивание данных по оси OZ
		{
			var dz = (MaxZ - MinZ)/(d[i].length -1 ) ;
			for (var j = 0; j < d[i].length; j += 1)
				d[i][j][2] = MinZ + j*dz;
		}

		var dd1 = [];
		var DZ = 7;
		var dz = (MaxZ - MinZ)/DZ;
		for (var i = 0; i < d.length; i += 1) 
		{
			var dd2 = [];
			for (var j = 0; j < DZ; j += 1)
			{
				var corel = 100;
				var Index = 0;
				for (var k = 0; k < d[i].length; k += 1)
				{
					var CurCorel =  Math.abs((d[i][k][2] - MinZ) - dz*j);
					if (CurCorel < corel)
					{
						corel = CurCorel;
						Index = k;
					}
				}
				var p = d[i][Index];
				p[2] = MinZ + dz*(j);
				dd2.push(p);
			}
			dd1.push(dd2.reverse());
		}
		Data = dd1;
	}
	function DrawData()
	{
		for (var i = 1; i < Data.length; i += 1)
			for (var j = 1; j < Data[i].length; j +=1 )
				DrawPolygon([ Data[i][j],Data[i][j-1],Data[i-1][j-1],Data[i-1][j]  ]);
		for (var i = 0; i < Data.length; i += 1)
			for (var j = 0; j < Data[i].length; j +=1 )
				DrawPoint(Data[i][j][0],Data[i][j][1],Data[i][j][2]);
	}


	
	return {
		//public
		DrawAxis:DrawAxis,
		DrawPoint:DrawPoint,
		RotateScene:RotateScene,
		DrawLine:DrawLine,
		DrawGraphic:DrawGraphic,
		DrawPolygon:DrawPolygon,
		Zoom:Zoom,
		Shift:Shift,
		TransformData:TransformData,
		DrawCharts:DrawCharts,
		DrawData:DrawData
	};
}());

graph3d.DrawAxis();
graph3d.RotateScene(-30,45,0);
graph3d.DrawCharts();

$.getJSON( "js/data.json", function( data ) {
			var d = [];
			var maxD = 0;
			for (var i = 0; i < data.length; i += 1)
			{
				var text = data[i].expiration;
				var date = new Date(text.replace(/(\d+)-(\d+)-(\d+)/, '$2/$3/$1'));

				if (date > maxD || i == 0)
					maxD = date;

				d.push([date, data[i].implied_volatility, data[i].moneyness]);
			}
		
			for (var i = 0; i < d.length; i += 1 )
			{
				d[i][0] =  ((maxD - d[i][0])/(1000*3600*24)).toFixed(0);
			}

			data = d;

			graph3d.TransformData(data);
			graph3d.DrawData();
		})	