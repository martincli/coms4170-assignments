/**
 * The $1 Unistroke Recognizer (JavaScript version)
 *
 *	Jacob O. Wobbrock, Ph.D.
 * 	The Information School
 *	University of Washington
 *	Seattle, WA 98195-2840
 *	wobbrock@uw.edu
 *
 *	Andrew D. Wilson, Ph.D.
 *	Microsoft Research
 *	One Microsoft Way
 *	Redmond, WA 98052
 *	awilson@microsoft.com
 *
 *	Yang Li, Ph.D.
 *	Department of Computer Science and Engineering
 * 	University of Washington
 *	Seattle, WA 98195-2840
 * 	yangli@cs.washington.edu
 *
 * The academic publication for the $1 recognizer, and what should be 
 * used to cite it, is:
 *
 *	Wobbrock, J.O., Wilson, A.D. and Li, Y. (2007). Gestures without 
 *	  libraries, toolkits or training: A $1 recognizer for user interface 
 *	  prototypes. Proceedings of the ACM Symposium on User Interface 
 *	  Software and Technology (UIST '07). Newport, Rhode Island (October 
 *	  7-10, 2007). New York: ACM Press, pp. 159-168.
 *
 * The Protractor enhancement was separately published by Yang Li and programmed 
 * here by Jacob O. Wobbrock:
 *
 *	Li, Y. (2010). Protractor: A fast and accurate gesture
 *	  recognizer. Proceedings of the ACM Conference on Human
 *	  Factors in Computing Systems (CHI '10). Atlanta, Georgia
 *	  (April 10-15, 2010). New York: ACM Press, pp. 2169-2172.
 *
 * This software is distributed under the "New BSD License" agreement:
 *
 * Copyright (C) 2007-2012, Jacob O. Wobbrock, Andrew D. Wilson and Yang Li.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the distribution.
 *    * Neither the names of the University of Washington nor Microsoft,
 *      nor the names of its contributors may be used to endorse or promote
 *      products derived from this software without specific prior written
 *      permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Jacob O. Wobbrock OR Andrew D. Wilson
 * OR Yang Li BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
 * OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
**/
//
// Point class
//
function Point(x, y) // constructor
{
	this.X = x;
	this.Y = y;
}
//
// Rectangle class
//
function Rectangle(x, y, width, height) // constructor
{
	this.X = x;
	this.Y = y;
	this.Width = width;
	this.Height = height;
}
//
// Unistroke class: a unistroke template
//
function Unistroke(name, points) // constructor
{
	this.Name = name;
	this.Points = Resample(points, NumPoints);
	var radians = IndicativeAngle(this.Points);
	this.Points = RotateBy(this.Points, -radians);
	this.Points = ScaleTo(this.Points, SquareSize);
	this.Points = TranslateTo(this.Points, Origin);
	this.Vector = Vectorize(this.Points); // for Protractor
}
//
// Result class
//
function Result(name, score) // constructor
{
	this.Name = name;
	this.Score = score;
}
//
// DollarRecognizer class constants
//
var NumUnistrokes = 12;
var NumPoints = 64;
var SquareSize = 250.0;
var Origin = new Point(0,0);
var Diagonal = Math.sqrt(SquareSize * SquareSize + SquareSize * SquareSize);
var HalfDiagonal = 0.5 * Diagonal;
var AngleRange = Deg2Rad(45.0);
var AnglePrecision = Deg2Rad(2.0);
var Phi = 0.5 * (-1.0 + Math.sqrt(5.0)); // Golden Ratio
//
// DollarRecognizer class
//
function DollarRecognizer() // constructor
{
	//
	// custom defined unistrokes
	//
	this.Unistrokes = new Array(NumUnistrokes);
	this.Unistrokes[0] = new Unistroke("play-pause", new Array(new Point(72,49),new Point(73,49),new Point(78,50),new Point(85,53),new Point(105,62),new Point(139,78),new Point(165,90),new Point(189,103),new Point(208,112),new Point(221,117),new Point(225,119),new Point(225,120),new Point(222,122),new Point(216,125),new Point(206,129),new Point(179,140),new Point(148,151),new Point(120,161),new Point(98,168),new Point(80,173),new Point(74,175),new Point(71,177)));
	this.Unistrokes[1] = new Unistroke("seek-forward", new Array(new Point(57,108),new Point(59,108),new Point(65,108),new Point(73,106),new Point(98,106),new Point(129,106),new Point(173,107),new Point(198,108),new Point(221,109),new Point(234,110),new Point(239,110),new Point(239,113),new Point(237,115),new Point(235,117),new Point(233,120),new Point(227,127),new Point(219,134),new Point(213,140),new Point(211,143)));
	this.Unistrokes[2] = new Unistroke("seek-backward", new Array(new Point(244,113),new Point(243,113),new Point(238,113),new Point(229,113),new Point(219,113),new Point(195,112),new Point(146,110),new Point(115,108),new Point(89,108),new Point(71,108),new Point(59,108),new Point(51,108),new Point(47,109),new Point(45,109),new Point(47,112),new Point(50,114),new Point(54,117),new Point(58,119),new Point(66,125),new Point(72,131),new Point(76,134),new Point(78,137)));
	this.Unistrokes[3] = new Unistroke("speed-increase", new Array(new Point(117,48),new Point(124,48),new Point(133,48),new Point(153,48),new Point(175,53),new Point(193,59),new Point(202,69),new Point(202,77),new Point(197,88),new Point(183,100),new Point(168,107),new Point(157,112),new Point(151,114),new Point(150,114),new Point(150,115),new Point(153,117),new Point(162,122),new Point(188,140),new Point(199,153),new Point(201,163),new Point(198,169),new Point(184,177),new Point(160,182),new Point(131,184),new Point(108,184),new Point(94,183),new Point(91,182)));
	this.Unistrokes[4] = new Unistroke("speed-decrease", new Array(new Point(160,47),new Point(158,47),new Point(154,46),new Point(148,46),new Point(141,46),new Point(121,46),new Point(103,48),new Point(91,54),new Point(88,60),new Point(87,66),new Point(90,73),new Point(104,86),new Point(120,96),new Point(135,102),new Point(142,103),new Point(145,103),new Point(143,103),new Point(141,103),new Point(137,104),new Point(133,106),new Point(120,113),new Point(109,125),new Point(101,146),new Point(101,157),new Point(108,166),new Point(126,174),new Point(147,179),new Point(162,181),new Point(174,181),new Point(179,179)));
	this.Unistrokes[5] = new Unistroke("volume-increase", new Array(new Point(97,187),new Point(97,184),new Point(98,180),new Point(99,173),new Point(99,165),new Point(99,142),new Point(99,116),new Point(99,94),new Point(99,81),new Point(99,74),new Point(100,69),new Point(100,68),new Point(102,68),new Point(105,68),new Point(110,68),new Point(123,68),new Point(141,66),new Point(160,64),new Point(175,64),new Point(185,64),new Point(190,64),new Point(191,64),new Point(192,67),new Point(192,72),new Point(193,82),new Point(193,92),new Point(194,113),new Point(196,135),new Point(198,153),new Point(200,169),new Point(201,177),new Point(202,180),new Point(202,181),new Point(202,182)));
	this.Unistrokes[6] = new Unistroke("volume-decrease", new Array(new Point(103,61),new Point(103,62),new Point(103,66),new Point(103,78),new Point(102,95),new Point(101,110),new Point(100,123),new Point(99,137),new Point(99,149),new Point(99,160),new Point(100,163),new Point(100,165),new Point(100,166),new Point(101,167),new Point(101,168),new Point(101,169),new Point(103,169),new Point(107,169),new Point(113,169),new Point(122,169),new Point(143,169),new Point(164,169),new Point(181,169),new Point(190,169),new Point(191,169),new Point(191,166),new Point(194,159),new Point(194,154),new Point(196,136),new Point(196,114),new Point(196,93),new Point(193,74),new Point(193,64),new Point(193,57)));
	this.Unistrokes[7] = new Unistroke("mute-unmute", new Array(new Point(125,54),new Point(126,54),new Point(128,53),new Point(131,53),new Point(141,52),new Point(158,54),new Point(177,63),new Point(195,77),new Point(208,97),new Point(212,117),new Point(212,137),new Point(203,153),new Point(190,164),new Point(165,176),new Point(145,180),new Point(125,180),new Point(108,177),new Point(95,172),new Point(86,163),new Point(81,148),new Point(80,135),new Point(80,120),new Point(84,104),new Point(91,90),new Point(108,73)));
	this.Unistrokes[8] = new Unistroke("size-increase", new Array(new Point(51,159),new Point(54,159),new Point(59,159),new Point(66,159),new Point(82,159),new Point(99,159),new Point(114,159),new Point(127,159),new Point(137,159),new Point(142,159),new Point(146,159),new Point(148,159),new Point(149,158),new Point(149,154),new Point(150,148),new Point(151,134),new Point(151,118),new Point(152,103),new Point(153,89),new Point(154,80),new Point(154,75),new Point(155,73),new Point(155,72),new Point(156,71),new Point(158,71),new Point(163,71),new Point(181,71),new Point(204,72),new Point(227,72),new Point(247,72),new Point(259,72),new Point(263,72)));
	this.Unistrokes[9] = new Unistroke("size-decrease", new Array(new Point(27,83),new Point(30,83),new Point(36,82),new Point(44,82),new Point(57,82),new Point(84,83),new Point(121,83),new Point(136,83),new Point(143,83),new Point(143,84),new Point(143,85),new Point(143,89),new Point(143,93),new Point(143,106),new Point(142,128),new Point(142,141),new Point(142,151),new Point(142,159),new Point(143,164),new Point(143,166),new Point(145,166),new Point(148,166),new Point(152,166),new Point(159,166),new Point(180,166),new Point(205,168),new Point(228,169),new Point(246,170),new Point(257,170),new Point(258,170),new Point(259,170)));
	this.Unistrokes[10] = new Unistroke("seek-to-start", new Array(new Point(38,140),new Point(39,140),new Point(41,141),new Point(56,141),new Point(79,138),new Point(103,131),new Point(131,123),new Point(155,113),new Point(175,100),new Point(188,79),new Point(188,67),new Point(186,60),new Point(181,55),new Point(173,51),new Point(163,51),new Point(148,51),new Point(135,58),new Point(123,79),new Point(121,87),new Point(125,104),new Point(150,124),new Point(163,130),new Point(205,141),new Point(228,143),new Point(242,143),new Point(249,143),new Point(250,143),new Point(251,143)));
	this.Unistrokes[11] = new Unistroke("speed-reset", new Array(new Point(59,44),new Point(61,44),new Point(67,44),new Point(76,44),new Point(86,43),new Point(123,43),new Point(153,42),new Point(177,42),new Point(199,42),new Point(212,43),new Point(221,43),new Point(226,43),new Point(228,43),new Point(229,43),new Point(229,45),new Point(229,51),new Point(228,70),new Point(226,88),new Point(224,108),new Point(223,126),new Point(221,141),new Point(221,153),new Point(220,160),new Point(220,162),new Point(220,163),new Point(218,164),new Point(214,164),new Point(208,165),new Point(188,166),new Point(146,167),new Point(131,167),new Point(95,166),new Point(81,165),new Point(75,164),new Point(72,164),new Point(71,164),new Point(69,164),new Point(68,164),new Point(66,164),new Point(65,164),new Point(63,164),new Point(62,164),new Point(59,164),new Point(57,164),new Point(57,160),new Point(57,153),new Point(60,145),new Point(61,122),new Point(63,98),new Point(64,83),new Point(64,72),new Point(65,60),new Point(65,51),new Point(66,43),new Point(67,40),new Point(67,39)));
	//
	// The $1 Gesture Recognizer API begins here -- 3 methods: Recognize(), AddGesture(), and DeleteUserGestures()
	//
	this.Recognize = function(points, useProtractor)
	{
		points = Resample(points, NumPoints);
		var radians = IndicativeAngle(points);
		points = RotateBy(points, -radians);
		points = ScaleTo(points, SquareSize);
		points = TranslateTo(points, Origin);
		var vector = Vectorize(points); // for Protractor

		var b = +Infinity;
		var u = -1;
		for (var i = 0; i < this.Unistrokes.length; i++) // for each unistroke
		{
			var d;
			if (useProtractor) // for Protractor
				d = OptimalCosineDistance(this.Unistrokes[i].Vector, vector);
			else // Golden Section Search (original $1)
				d = DistanceAtBestAngle(points, this.Unistrokes[i], -AngleRange, +AngleRange, AnglePrecision);
			if (d < b) {
				b = d; // best (least) distance
				u = i; // unistroke
			}
		}
		return (u == -1) ? new Result("No match.", 0.0) : new Result(this.Unistrokes[u].Name, useProtractor ? 1.0 / b : 1.0 - b / HalfDiagonal);
	};
	this.AddGesture = function(name, points)
	{
		this.Unistrokes[this.Unistrokes.length] = new Unistroke(name, points); // append new unistroke
		var num = 0;
		for (var i = 0; i < this.Unistrokes.length; i++) {
			if (this.Unistrokes[i].Name == name)
				num++;
		}
		return num;
	}
	this.DeleteUserGestures = function()
	{
		this.Unistrokes.length = NumUnistrokes; // clear any beyond the original set
		return NumUnistrokes;
	}
}
//
// Private helper functions from this point down
//
function Resample(points, n)
{
	var I = PathLength(points) / (n - 1); // interval length
	var D = 0.0;
	var newpoints = new Array(points[0]);
	for (var i = 1; i < points.length; i++)
	{
		var d = Distance(points[i - 1], points[i]);
		if ((D + d) >= I)
		{
			var qx = points[i - 1].X + ((I - D) / d) * (points[i].X - points[i - 1].X);
			var qy = points[i - 1].Y + ((I - D) / d) * (points[i].Y - points[i - 1].Y);
			var q = new Point(qx, qy);
			newpoints[newpoints.length] = q; // append new point 'q'
			points.splice(i, 0, q); // insert 'q' at position i in points s.t. 'q' will be the next i
			D = 0.0;
		}
		else D += d;
	}
	if (newpoints.length == n - 1) // somtimes we fall a rounding-error short of adding the last point, so add it if so
		newpoints[newpoints.length] = new Point(points[points.length - 1].X, points[points.length - 1].Y);
	return newpoints;
}
function IndicativeAngle(points)
{
	var c = Centroid(points);
	return Math.atan2(c.Y - points[0].Y, c.X - points[0].X);
}
function RotateBy(points, radians) // rotates points around centroid
{
	var c = Centroid(points);
	var cos = Math.cos(radians);
	var sin = Math.sin(radians);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = (points[i].X - c.X) * cos - (points[i].Y - c.Y) * sin + c.X
		var qy = (points[i].X - c.X) * sin + (points[i].Y - c.Y) * cos + c.Y;
		newpoints[newpoints.length] = new Point(qx, qy);
	}
	return newpoints;
}
function ScaleTo(points, size) // non-uniform scale; assumes 2D gestures (i.e., no lines)
{
	var B = BoundingBox(points);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = points[i].X * (size / B.Width);
		var qy = points[i].Y * (size / B.Height);
		newpoints[newpoints.length] = new Point(qx, qy);
	}
	return newpoints;
}
function TranslateTo(points, pt) // translates points' centroid
{
	var c = Centroid(points);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = points[i].X + pt.X - c.X;
		var qy = points[i].Y + pt.Y - c.Y;
		newpoints[newpoints.length] = new Point(qx, qy);
	}
	return newpoints;
}
function Vectorize(points) // for Protractor
{
	var sum = 0.0;
	var vector = new Array();
	for (var i = 0; i < points.length; i++) {
		vector[vector.length] = points[i].X;
		vector[vector.length] = points[i].Y;
		sum += points[i].X * points[i].X + points[i].Y * points[i].Y;
	}
	var magnitude = Math.sqrt(sum);
	for (var i = 0; i < vector.length; i++)
		vector[i] /= magnitude;
	return vector;
}
function OptimalCosineDistance(v1, v2) // for Protractor
{
	var a = 0.0;
	var b = 0.0;
	for (var i = 0; i < v1.length; i += 2) {
		a += v1[i] * v2[i] + v1[i + 1] * v2[i + 1];
                b += v1[i] * v2[i + 1] - v1[i + 1] * v2[i];
	}
	var angle = Math.atan(b / a);
	return Math.acos(a * Math.cos(angle) + b * Math.sin(angle));
}
function DistanceAtBestAngle(points, T, a, b, threshold)
{
	var x1 = Phi * a + (1.0 - Phi) * b;
	var f1 = DistanceAtAngle(points, T, x1);
	var x2 = (1.0 - Phi) * a + Phi * b;
	var f2 = DistanceAtAngle(points, T, x2);
	while (Math.abs(b - a) > threshold)
	{
		if (f1 < f2) {
			b = x2;
			x2 = x1;
			f2 = f1;
			x1 = Phi * a + (1.0 - Phi) * b;
			f1 = DistanceAtAngle(points, T, x1);
		} else {
			a = x1;
			x1 = x2;
			f1 = f2;
			x2 = (1.0 - Phi) * a + Phi * b;
			f2 = DistanceAtAngle(points, T, x2);
		}
	}
	return Math.min(f1, f2);
}
function DistanceAtAngle(points, T, radians)
{
	var newpoints = RotateBy(points, radians);
	return PathDistance(newpoints, T.Points);
}
function Centroid(points)
{
	var x = 0.0, y = 0.0;
	for (var i = 0; i < points.length; i++) {
		x += points[i].X;
		y += points[i].Y;
	}
	x /= points.length;
	y /= points.length;
	return new Point(x, y);
}
function BoundingBox(points)
{
	var minX = +Infinity, maxX = -Infinity, minY = +Infinity, maxY = -Infinity;
	for (var i = 0; i < points.length; i++) {
		minX = Math.min(minX, points[i].X);
		minY = Math.min(minY, points[i].Y);
		maxX = Math.max(maxX, points[i].X);
		maxY = Math.max(maxY, points[i].Y);
	}
	return new Rectangle(minX, minY, maxX - minX, maxY - minY);
}
function PathDistance(pts1, pts2)
{
	var d = 0.0;
	for (var i = 0; i < pts1.length; i++) // assumes pts1.length == pts2.length
		d += Distance(pts1[i], pts2[i]);
	return d / pts1.length;
}
function PathLength(points)
{
	var d = 0.0;
	for (var i = 1; i < points.length; i++)
		d += Distance(points[i - 1], points[i]);
	return d;
}
function Distance(p1, p2)
{
	var dx = p2.X - p1.X;
	var dy = p2.Y - p1.Y;
	return Math.sqrt(dx * dx + dy * dy);
}
function Deg2Rad(d) { return (d * Math.PI / 180.0); }