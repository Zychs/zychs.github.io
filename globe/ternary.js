// Ternary headings on the unit sphere: one fixed great-circle step, and turns of ±120°.
// Each heading is a path that closes in equal steps around the circumference.
(function () {
  var PATH_SEGMENTS = 24;
  var STEP_RADIANS = (Math.PI * 2) / PATH_SEGMENTS;
  var TROUGH_RADIANS = 0.16;
  var COLLECTIBLE_COUNT = 8;
  var COS120 = -0.5;
  var SIN120 = Math.sqrt(3) / 2;

  function copy(v) {
    return { x: v.x, y: v.y, z: v.z };
  }

  function dot(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  function cross(a, b) {
    return {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x
    };
  }

  function length(v) {
    return Math.hypot(v.x, v.y, v.z);
  }

  function scale(v, s) {
    return { x: v.x * s, y: v.y * s, z: v.z * s };
  }

  function add(a, b) {
    return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
  }

  function normalize(v) {
    var n = length(v);
    if (!(n > 0)) throw new Error("zero vector");
    return scale(v, 1 / n);
  }

  // Drop the part of heading that lies along position, then restore unit length.
  function transportHeading(heading, position) {
    var radial = dot(heading, position);
    return normalize({
      x: heading.x - position.x * radial,
      y: heading.y - position.y * radial,
      z: heading.z - position.z * radial
    });
  }

  function pose(position, heading) {
    return { position: copy(position), heading: copy(heading) };
  }

  function initialPose() {
    return pose({ x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 0 });
  }

  function advance(state) {
    var position = state.position;
    var heading = state.heading;
    var along = Math.cos(STEP_RADIANS);
    var across = Math.sin(STEP_RADIANS);
    var nextPosition = normalize(add(scale(position, along), scale(heading, across)));
    var nextHeading = transportHeading(heading, nextPosition);
    return pose(nextPosition, nextHeading);
  }

  function rotateHeading(state, sign) {
    var position = state.position;
    var tangent = transportHeading(state.heading, position);
    var bitangent = normalize(cross(position, tangent));
    var nextHeading = add(scale(tangent, COS120), scale(bitangent, sign * SIN120));
    nextHeading = transportHeading(nextHeading, position);
    return pose(position, nextHeading);
  }

  function turnLeft(state) {
    return rotateHeading(state, 1);
  }

  function turnRight(state) {
    return rotateHeading(state, -1);
  }

  function triad(state) {
    return [
      copy(transportHeading(state.heading, state.position)),
      copy(turnLeft(state).heading),
      copy(turnRight(state).heading)
    ];
  }

  function circlePoint(position, heading, theta, normal, offset) {
    var along = Math.cos(theta);
    var across = Math.sin(theta);
    var spine = {
      x: position.x * along + heading.x * across,
      y: position.y * along + heading.y * across,
      z: position.z * along + heading.z * across
    };
    if (!offset) return normalize(spine);
    var out = Math.cos(offset);
    var lift = Math.sin(offset);
    return normalize({
      x: spine.x * out + normal.x * lift,
      y: spine.y * out + normal.y * lift,
      z: spine.z * out + normal.z * lift
    });
  }

  function ring(position, heading, normal, offset) {
    var points = [];
    for (var i = 0; i < PATH_SEGMENTS; i++) {
      points.push(circlePoint(position, heading, i * STEP_RADIANS, normal, offset));
    }
    return points;
  }

  function collectibles(position, heading, normal) {
    var points = [];
    for (var k = 0; k < COLLECTIBLE_COUNT; k++) {
      var theta = (k + 0.5) * ((Math.PI * 2) / COLLECTIBLE_COUNT);
      points.push(circlePoint(position, heading, theta, normal, 0));
    }
    return points;
  }

  // Paths are the mover's own triad of great circles. Each one is sampled in
  // equal steps that add up to the circumference. The dashed troughs sit at a
  // fixed angle to either side, and the collectibles lie evenly in that groove.
  function localPaths(state) {
    var position = state.position;
    var headings = triad(state);
    var routes = [];
    for (var i = 0; i < headings.length; i++) {
      var heading = headings[i];
      var normal = normalize(cross(position, heading));
      routes.push({
        active: i === 0,
        heading: copy(heading),
        normal: normal,
        spine: ring(position, heading, normal, 0),
        troughs: [
          ring(position, heading, normal, TROUGH_RADIANS),
          ring(position, heading, normal, -TROUGH_RADIANS)
        ],
        collectibles: collectibles(position, heading, normal)
      });
    }
    return routes;
  }

  var api = {
    stepRadians: STEP_RADIANS,
    pathSegments: PATH_SEGMENTS,
    troughRadians: TROUGH_RADIANS,
    collectibleCount: COLLECTIBLE_COUNT,
    initialPose: initialPose,
    advance: advance,
    turnLeft: turnLeft,
    turnRight: turnRight,
    triad: triad,
    localPaths: localPaths
  };

  if (typeof window !== "undefined" && window) {
    window.TernaryGlobe = api;
    window.advance = api.advance;
    window.turnLeft = api.turnLeft;
    window.turnRight = api.turnRight;
  }
})();
