var graph3d = (function() {
	'use strict';

	var SvgHeight = 800; //высота полотна
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
 
	var zoom = 1.3; //значение приближения - отдаления

	var DATA = [];
	
	
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
		var A = toRadians(currx);	var B = toRadians(curry); var C = toRadians(currz);
		var cosA = Math.cos(A);
		var sinA = Math.sin(A);
		var cosB = Math.cos(B);
		var sinB = Math.sin(B);
		var cosC = Math.cos(C);
		var sinC = Math.sin(C);


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
				.on('mousedown',function() {
					isDown = true;
				})
				.on('mouseup',function() {
					isDown = false;
				})

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
		var c=d3.hsl((maxy+100), 0.6, 0.5).rgb();
              

		svg.append('path')
			.attr('d',d)
			.attr('stroke','black')
			.attr('points', d1.trim() )
			.attr('class', 'polygon')
			.attr('fill',"rgb("+parseInt(c.r)+","+parseInt(c.g)+","+parseInt(c.b)+")")
			.attr('fill-opacity',0.7)
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
			if (Math.sin(toRadians(curry)) < 0)
				var a = lines[i];
			else
				var a = lines[lines.length-i-1];

			var points = a.getAttribute('points').split(' ');
			a = lines[i]
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
	function RotateScene(rx,ry,rz)
	{
		if ( (currx >= -90 || rx > 0) && (currx <= 0 || rx < 0) ) // Ограничение на движение по оси OX
			currx = currx + rx;
		
		curry = curry + ry;
		currz = currz + rz;
		
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

		while (i--) {
	    	if (Dates[i] == Dates[i-1]) {
	        	Dates.splice(i, 1);
	    	}
		}
		var dd = []
		for (var i = 0; i < Dates.length; i += 1)
		{
			dd[i] = DATA.filter( function(item){ if (item[0] == Dates[i]) return item; })
		}

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
		
		console.log(MinZ +' '+MaxZ);

		var ZD = 7;
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
	function DrawData()
	{
		
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
		GetData:GetData
	};
}());

graph3d.DrawAxis();
graph3d.RotateScene(-30,45,0);


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

			graph3d.GetData(data);
		})	





