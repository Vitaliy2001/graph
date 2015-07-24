var graph3d = (function() {
	'use strict';

	var SvgHeight = 500; //высота полотна
	var SvgWidth = 500; //ширина полотна

	var currx = 0; //поворот по х в градусах
	var curry = 0; //поворот по у
	var currz = 0; //поворот по з

	var shiftx = 0;
	var shifty = 0;
	var shiftz = 0;

	var mousePosX = 0;
	var mousePosY = 0;
	var isDown = false;
 
	var zoom = 1.0; //значение приближения - отдаления
	
	
	function toRadians (angle) 
	{
  		return angle * (Math.PI / 180);
	}
	function Transform(x,y,z,rx,ry,rz)
	{
		var A = toRadians(rx);	var B = toRadians(ry); var C = toRadians(rz);
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

		var x1 = x*zoom + shiftx;
		var y1 = -y*zoom + shifty;
		var z1 = z*zoom + shiftz;

		var x2 = x1*cosC - y1*sinC + z1*0;
		var y2 = x1*sinC + y1*cosC + z1*0;
		var z2 = x1*0 + y1*0 + z1;

		var x3 = x2*cosB - y2*0 - z2*sinB;
		var y3 = x2*0 + y2*1 + z2*0;
		var z3 = x2*sinB + y2*0 + z2*cosB;

		var x4 = x3 + y3*0 + z3*0;
		var y4 = x3*0 + cosA*y3 - sinA*z3;
		var z4 = x3*0 + sinA*y3 + cosA*z3;

		
		return [x4+xd,y4+yd,z4];
	}
	function DrawAxis()
	{
		var c = [0,0,0];
		var c1 = Transform(0,0,0,currx,curry,currz); 
		
		var p1 = [220,0,0];
		var p2 = [0,220,0];
		var p3 = [0,0,220];

		var p1t = Transform(p1[0],p1[1],p1[2],currx,curry,currz);
		var p2t = Transform(p2[0],p2[1],p2[2],currx,curry,currz);
		var p3t = Transform(p3[0],p3[1],p3[2],currx,curry,currz);

		var svg = d3.select('#d3container')
				.append('svg')
				.attr('id','GraphSvg')
				.attr('height',SvgHeight)
				.attr('width',SvgWidth)
				.on('mousedown',function() {
					console.log('down');
					isDown = true;
				})
				.on('mouseup',function() {
					console.log('up');
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

				RotateScene(dy,dx,dy)

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
	};
	function DrawPoint(x,y,z)
	{
		var p = Transform(x,y,z,currx,curry,currz);
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
	};
	function DrawLine(points)
	{
		var d = '';	var d1 = '';
		var p;	var pt;
		for (var i = 0; i < points.length; i += 1)
		{
			p = [ points[i][0], points[i][1], points[i][2] ];
			pt = Transform( p[0],p[1],p[2],currx,curry,currz );
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
	};
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

		for (var i = 0; i < points.length; i += 1)
		{
			p = [ points[i][0], points[i][1], points[i][2] ];
			pt = Transform( p[0],p[1],p[2],currx,curry,currz );
			if (i == 0)
				d = 'M';
			else
				d += 'L';
			d += pt[0] + ' ' + pt[1];
			d1 += p[0] + ' ' + p[1] + ' ' + p[2] + ' '; 
			DrawPoint(p[0],p[1],p[2]);
		}
		var svg = d3.select('#GraphSvg');
		svg.append('path')
			.attr('d',d)
			.attr('stroke','black')
			.attr('points', d1.trim())
			.attr('class', 'line')
			.attr('fill','red')
	}
	function RotatePoints()
	{
		var svg = d3.select('#GraphSvg');
		var points = GraphSvg.getElementsByClassName('point');
		for (var i = 0; i < points.length; i += 1)
		{			
			var a = points[i];
			var p = Transform(a.getAttribute('x1'),a.getAttribute('y1'),a.getAttribute('z1'),currx,curry,currz);
			a.setAttribute('cx',p[0]) ;
			a.setAttribute('cy',p[1]) ;
		}
	}
	function RotateLines(){
		var svg = d3.select('svg');
		var lines = GraphSvg.getElementsByClassName('line');
		for (var i = 0; i < lines.length; i += 1)
		{			
			var a = lines[i];
			var points = a.getAttribute('points').split(' ');
			var d = '';
			for (var j = 0; j < points.length; j += 3)
			{
				var p = Transform(points[j],points[j+1],points[j+2],currx,curry,currz)
				
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
		currx = currx + rx;
		curry = curry + ry;
		currz = currz + rz;
		RotateLines();
		RotatePoints();
	}
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


	
	return {
		//public
		DrawAxis:DrawAxis,
		DrawPoint:DrawPoint,
		RotateScene:RotateScene,
		DrawLine:DrawLine,
		DrawGraphic:DrawGraphic,
		DrawPolygon:DrawPolygon,
		Zoom:Zoom,
		Shift:Shift
	};
}());

graph3d.DrawAxis();

$.getJSON( "js/data.json", function( data ) {
	var d = [];
	var maxD = 0;
	for (var i = 0; i < data.length; i += 1)
	{
		var text = data[i].expiration;
		var date = new Date(text.replace(/(\d+)-(\d+)-(\d+)/, '$2/$3/$1'));

		if (date > maxD || i == 0)
			maxD = date;

		d.push([data[i].implied_volatility, date, data[i].moneyness]);
	}
	
	for (var i = 0; i < d.length; i += 1 )
	{
		d[i][1] = (maxD - d[i][1])/(1000*3600*24)
	}

	graph3d.DrawGraphic(d);
})

