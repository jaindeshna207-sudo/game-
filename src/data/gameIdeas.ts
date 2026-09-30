import { GameIdea } from '../types/game';

export const CLASSIC_GAME_IDEAS: GameIdea[] = [
  {
    id: 'snake-classic',
    title: 'Neon Matrix Snake',
    classicInspiration: 'Nokia Snake (1997) / Blockade (1976)',
    tagline: 'The timeless grid crawler with acceleration curves and glowing power fruits.',
    category: 'arcade',
    complexity: 'Beginner',
    estimatedDevTime: '1 - 2 hours',
    coreLoop: 'Direct an ever-growing serpent to consume food cells while avoiding walls and self-collision.',
    theTwist: 'Special time-limited golden apples provide temporary speed bursts, wall ghosting, or tail shrinkers.',
    keyMechanics: ['Grid coordinate array', 'Queue-based movement step', 'Instant direction flip prevention', 'Dynamic speed tick ramp'],
    techStack: 'HTML5 2D Canvas or SVG Grid + RequestAnimationFrame loop',
    aiStudioPrompt: `Create a single-page modern Classic Snake Game in React with TypeScript and Tailwind CSS.
Features required:
1. 25x25 cell responsive canvas with retro grid lines and glowing neon aesthetic.
2. Fluid keyboard controls (Arrow keys and WASD) with smooth touch D-pad for mobile.
3. Apple spawning algorithm that never places food on the snake body.
4. Special power orbs: Golden Apple (+3 score), Ghost Berry (temporarily pass through walls for 5s), Freeze Berry (slows speed).
5. Score, High Score (persisted in localStorage), Current Level, and Length counter.
6. Audio sound effects via Web Audio API oscillators for eat, turn, and game over.
7. Game over summary modal with instant spacebar restart.`
  },
  {
    id: 'tetris-stack',
    title: 'Retro Tetromino Fall',
    classicInspiration: 'Tetris (Alexey Pajitnov, 1984)',
    tagline: 'Geometric block puzzle with standard SRS rotations, ghost piece, and hold queue.',
    category: 'puzzle',
    complexity: 'Intermediate',
    estimatedDevTime: '3 - 4 hours',
    coreLoop: 'Manipulate falling 4-block polyominoes into complete horizontal lines to clear the matrix.',
    theTwist: 'Combo multipliers, hold slots, and particle sparks on multi-line clears (Tetris!).',
    keyMechanics: ['10x20 2D Matrix', '7 Standard Tetromino shapes (I, J, L, O, S, T, Z)', 'Super Rotation System (SRS) kick tests', 'Ghost projection guide'],
    techStack: 'React State + Canvas/CSS Grid + Web Audio Synth',
    aiStudioPrompt: `Build a production-quality classic Tetris block puzzle game in React with TypeScript and Tailwind CSS.
Include:
1. 10 wide by 20 high playing board with ghost piece showing drop projection.
2. 7 standard tetromino tetrominoes (I, J, L, O, S, T, Z) with authentic colors.
3. Standard controls: Left/Right arrows, Down arrow soft drop, Up arrow rotate, Spacebar hard drop, C key to Hold piece.
4. Next piece queue preview (1-3 pieces) and Hold piece container.
5. Line clear score table (Single: 100, Double: 300, Triple: 500, Tetris: 800 * level).
6. Increasing drop speed as levels progress every 10 cleared lines.
7. Responsive layout with on-screen virtual touch buttons for mobile players.`
  },
  {
    id: 'bounce-breakout',
    title: 'Breakout Brick Shatter',
    classicInspiration: 'Breakout (Atari, 1976) / Arkanoid (Taito, 1986)',
    tagline: 'Paddle-driven ball deflection with angle deflection math and tumbling power-ups.',
    category: 'physics',
    complexity: 'Intermediate',
    estimatedDevTime: '2 - 3 hours',
    coreLoop: 'Bounce one or more balls off a player-guided bottom paddle to shatter all destructible bricks.',
    theTwist: 'Bricks drop collectible powerup capsules: Laser cannons, Multi-ball (3 balls active), Extended paddle, and Sticky glue.',
    keyMechanics: ['Vector bounce reflection', 'Paddle impact offset angle modulation', 'AABB bounding box brick collision', 'Multiple hit point bricks'],
    techStack: 'HTML5 2D Canvas + delta-time physics step',
    aiStudioPrompt: `Create a rich 2D Breakout / Arkanoid brick breaking game in React with HTML5 Canvas.
Key requirements:
1. Player paddle controlled by mouse movement, touch drag, or Left/Right keyboard arrows.
2. Ball reflection with realistic angle variation: hitting the edges of the paddle yields sharper horizontal rebound.
3. Multi-tier bricks: standard 1-hit, armored 2-hit (cracks visible), and golden unbreakable bricks.
4. Dropping powerup capsules: Wide Paddle (+50% width for 12s), Multi-Ball (spawns 2 additional balls), Laser Cannon (shoot bricks directly with Space), and Slow Ball.
5. Multi-level progression with varying brick formations (Pyramid, Fortress, Checkerboard).
6. Synthesized 8-bit sound effects for brick smash, paddle bounce, and powerup collection.`
  },
  {
    id: 'mini-mario-runner',
    title: 'Pixel Kingdom Jumper',
    classicInspiration: 'Super Mario Bros (Nintendo, 1985)',
    tagline: 'Side-scrolling 2D platformer with bounce physics, coin blocks, and patrolling minions.',
    category: 'platform',
    complexity: 'Intermediate',
    estimatedDevTime: '3 - 5 hours',
    coreLoop: 'Run and jump across obstacles, collect gold coins, stomp patrolling enemies, and reach the flagpole.',
    theTwist: 'Mystery question mark blocks that bounce up on head-butt, revealing coins or invincibility stars.',
    keyMechanics: ['Tile-based level map', 'Platform collision resolution (top, bottom, sides)', 'Variable jump height (hold to jump higher)', 'Stomp collision velocity boost'],
    techStack: 'HTML5 Canvas 2D + Simple Euler Physics (gravity, friction, velocity)',
    aiStudioPrompt: `Build a side-scrolling retro 2D platformer game inspired by classic 8-bit Super Mario in React with TypeScript.
Features needed:
1. Smooth character physics: running acceleration, deceleration friction, gravity, and jump impulse with head-bump block collision.
2. Interactivity: Bouncing '?' question blocks that give coins and score, destroyable brick blocks, and pipes.
3. Enemies: Walking Goomba-style creatures that patrol back and forth; jumping on top squashes them with an upward bounce, while side contact costs a life.
4. Level layout: Holes/pitfalls to jump over, coin clusters, and a finishing castle flag pole.
5. HUD displaying Score, Coins collected, Lives (3), and Level countdown timer.
6. Retro synth Web Audio SFX for jump, coin chime, enemy stomp, and level clear fanfare.`
  },
  {
    id: 'space-invaders',
    title: 'Cosmic Shield Defender',
    classicInspiration: 'Space Invaders (Tomohiro Nishikado, 1978)',
    tagline: 'Marching alien armada, destructible defensive bunkers, and descending dread.',
    category: 'arcade',
    complexity: 'Beginner',
    estimatedDevTime: '2 - 3 hours',
    coreLoop: 'Move a mobile cannon horizontally across the screen bottom to shoot down waves of descending aliens.',
    theTwist: 'Dynamic tempo: as fewer invaders remain, the marching fleet speeds up frantically.',
    keyMechanics: ['Fleet grid synchronized march & drop', 'Player plasma projectile pool', 'Destructible pixel bunker shields', 'Mystery red UFO pass-by'],
    techStack: 'HTML5 Canvas + sprite state loops',
    aiStudioPrompt: `Build an authentic Space Invaders arcade shooter in React with TypeScript and Tailwind CSS.
Include:
1. Classic 5-row by 11-column grid of alien invaders marching horizontally, shifting down and speeding up whenever hitting edge bounds.
2. Player base cannon moving horizontally with rapid single-shot plasma bolts.
3. 3-4 green defensive bunker shields that take pixel-level damage from both alien bombs and player lasers.
4. Occasional mystery flying saucer (UFO) cruising along the top screen giving 50-300 bonus score.
5. Wave progression: each cleared fleet restarts with aliens starting 1 row lower.
6. Authentic 4-note marching sound loop and crisp laser/explosion Web Audio synthesizers.`
  },
  {
    id: 'pac-maze',
    title: 'Neon Maze Chomp',
    classicInspiration: 'Pac-Man (Namco, 1980)',
    tagline: 'Grid navigation, pellet collection, and predatory AI ghosts with scatter/chase states.',
    category: 'arcade',
    complexity: 'Advanced',
    estimatedDevTime: '4 - 6 hours',
    coreLoop: 'Navigate a blue maze eating pellets while outmaneuvering 4 uniquely programmed ghosts.',
    theTwist: 'Power pellets turn the ghosts blue and vulnerable for 8 seconds, reversing the predator-prey dynamic.',
    keyMechanics: ['Tilemap waypoint pathfinding', 'Ghost AI personality behaviors (Blinky chases, Pinky ambushes)', 'Side wraparound warp tunnels', 'Fruit bonus spawns'],
    techStack: 'Canvas 2D + Tilemap Matrix + Manhattan Distance Pathfinding',
    aiStudioPrompt: `Create a browser-playable Pac-Man style maze game in React with HTML5 Canvas.
Features:
1. Symmetric retro neon maze layout with standard pellet grid and 4 corner power pellets.
2. Player chomp character with responsive directional buffering at corridor intersections.
3. 4 colored ghosts with distinct target behaviors (Direct pursuer, ambush interceptor, random wanderer).
4. Power Pellet mode: ghosts turn flashing cyan, flee, and can be eaten for 200, 400, 800, 1600 combo points.
5. Warp tunnels on left/right screen edges for instant teleportation.
6. 3 Lives, High Score tracking, and 8-bit chomp chomp audio synthesis.`
  },
  {
    id: 'asteroids-inertia',
    title: 'Zero-G Asteroid Miner',
    classicInspiration: 'Asteroids (Atari, 1979)',
    tagline: 'Inertial Newtonian spaceflight and splitting celestial rocks in vector graphics.',
    category: 'arcade',
    complexity: 'Intermediate',
    estimatedDevTime: '2 - 3 hours',
    coreLoop: 'Pilot a triangular spacecraft in true zero-gravity momentum, shooting floating asteroids into smaller fragments.',
    theTwist: 'Asteroids split from Large into 2 Medium, then into 2 Small, increasing speed and collision danger.',
    keyMechanics: ['Newtonian inertia (Thrust vector + velocity decay)', 'Screen wrapping on all 4 borders', 'Rotational angle turning', 'Polygonal split collisions'],
    techStack: 'HTML5 Canvas 2D Vector lines + Polygon Raycasting',
    aiStudioPrompt: `Develop a classic vector-style Asteroids space game in React and HTML5 Canvas.
Specs:
1. Minimalist glowing monochrome / vector line aesthetic.
2. Spacecraft physics: Left/Right arrows rotate angle, Up arrow applies forward thrust with particle exhaust plume, spacebar fires blaster.
3. Ship drifts smoothly with realistic inertia; coordinates wrap seamlessly around all 4 screen edges.
4. Asteroids with randomized jagged polygon silhouettes; shooting a large asteroid splits it into 2 medium pieces, which split into 2 small pieces.
5. Hyperspace panic button (Shift key) that randomly teleports ship with a 15% risk of landing on an asteroid.
6. Sound effects: deep thruster hum, photon blasters, and crunching asteroid explosions.`
  },
  {
    id: 'sokoban-pusher',
    title: 'Warehouse Box Pusher',
    classicInspiration: 'Sokoban (Hiroyuki Imabayashi, 1982)',
    tagline: 'Deterministic spatial logic where a single mistake can lock the entire room.',
    category: 'puzzle',
    complexity: 'Beginner',
    estimatedDevTime: '1 - 2 hours',
    coreLoop: 'Push crates onto designated target storage spots without wedging them into unsolvable corners.',
    theTwist: 'Undo history stack (Z key) and ice floor tiles that cause crates to slide until hitting an obstacle.',
    keyMechanics: ['Grid coordinate checks', 'Push legality validation (crate ahead + empty space behind)', 'Level win detection', 'Move counter and undo stack'],
    techStack: 'React Component Grid or Canvas + State history array',
    aiStudioPrompt: `Create an elegant Sokoban / Box Pusher puzzle game in React with TypeScript and Tailwind CSS.
Include:
1. 10 hand-crafted progressive puzzle levels ranging from tutorial to brain-melting.
2. Clean grid rendering with warehouse walls, target goal markers, crates, and warehouse keeper sprite.
3. Smooth push animations and invalid move rejection (cannot push two boxes at once or push into walls).
4. Full Undo feature (Z key) with unlimited step history.
5. Move count, level selector, and level reset shortcuts.
6. Visual celebration effects when all crates are positioned on their target spots.`
  },
  {
    id: 'minesweeper-classic',
    title: 'Classic Grid Minesweeper',
    classicInspiration: 'Minesweeper (Curt Johnson & Robert Donner, 1989)',
    tagline: 'Numerical deduction, risk management, and the satisfying rush of cascading reveals.',
    category: 'puzzle',
    complexity: 'Beginner',
    estimatedDevTime: '1 - 2 hours',
    coreLoop: 'Uncover all safe tiles on a concealed grid by calculating adjacent mine numbers.',
    theTwist: 'First click is guaranteed to be safe and trigger an open cascade; chord clicking (click numbered tile when flags match).',
    keyMechanics: ['2D neighbor array check (8 directions)', 'Flood-fill flood reveal on zero tiles', 'Right-click flag toggling', 'Timer & remaining mine counter'],
    techStack: 'Pure React state + Grid buttons + Confetti on win',
    aiStudioPrompt: `Build a clean, modern Minesweeper classic game in React with TypeScript.
Features:
1. Three standard difficulties: Beginner (9x9, 10 mines), Intermediate (16x16, 40 mines), Expert (30x16, 99 mines) + Custom size.
2. First-click safety guarantee (mines generated or moved after first click).
3. Recursive flood-fill reveal when clicking empty (0 adjacent mines) tiles.
4. Right-click or long-press to place red warning flags; prevents accidental detonation.
5. Double-click or middle-click chord mechanic to instantly uncover surrounding cells if flags match number.
6. Digital 7-segment style LCD timer and remaining mine counter.
7. Classic smiley face reset button with surprised face on click and sunglasses on victory.`
  },
  {
    id: 'flappy-hop',
    title: 'Flappy Sky Hopper',
    classicInspiration: 'Flappy Bird (Dong Nguyen, 2013)',
    tagline: 'Infuriatingly addictive one-tap vertical impulse navigation through pipe corridors.',
    category: 'platform',
    complexity: 'Beginner',
    estimatedDevTime: '1 - 2 hours',
    coreLoop: 'Tap spacebar or screen to flap upward against relentless gravity while steering between pairs of pipes.',
    theTwist: 'Wind gusts, day/night cycles, and floating golden rings that grant double points.',
    keyMechanics: ['Downward constant gravity', 'Fixed upward jump impulse', 'Scrolling pipe obstacle pairs with random gap offsets', 'Circle-to-rectangle hitbox collision'],
    techStack: 'Canvas 2D + Delta-time physics loop',
    aiStudioPrompt: `Build an authentic Flappy Bird arcade game in React with HTML5 Canvas.
Requirements:
1. Single tap or spacebar input for wing flap physics: gives upward velocity while gravity constantly pulls downward.
2. Character rotates nose-up on flap and dips nose-down in freefall.
3. Endless scrolling pipe pairs with randomized vertical gaps and passing clearance counter.
4. Pixel-perfect or tight circular collision detection with ground and pipes.
5. Bronze, Silver, Gold, and Platinum medals awarded based on high score milestones.
6. Crisp 8-bit sound effects for flap, point score chime, and bonk hit.`
  },
  {
    id: 'dino-runner',
    title: 'Offline Desert Runner',
    classicInspiration: 'Chrome Dino Game (Google, 2014)',
    tagline: 'Endless side-scrolling obstacle avoidance with jumping, ducking, and accelerating tempo.',
    category: 'platform',
    complexity: 'Beginner',
    estimatedDevTime: '1 - 2 hours',
    coreLoop: 'Run through an endless desert jumping over cacti and ducking under swooping pterodactyls.',
    theTwist: 'Day-to-night transitions every 700 points, meteor showers, and lunar low-gravity zones.',
    keyMechanics: ['Fixed player X position with scrolling world speed', 'Jump & Duck dual-state hitboxes', 'Procedural obstacle spacing', 'Speed scaling multiplier'],
    techStack: 'Canvas 2D + Procedural Spawner',
    aiStudioPrompt: `Create an endless desert dinosaur runner game in React with TypeScript.
Features:
1. Ground runner with Space/Up to jump and Down arrow to duck into a low crouch.
2. Scrolling terrain with ground ripples, clouds, and rising cacti clusters.
3. Flying pterodactyl birds flying at high, medium, and low heights requiring either ducking or jumping.
4. Smooth day/night inverted color theme transition every 500 points.
5. Score tally with milestone chime every 100 points and persistent personal best record.
6. Instant restart on spacebar tap.`
  },
  {
    id: 'pong-classic',
    title: 'Retro Cyber Pong',
    classicInspiration: 'Pong (Allan Alcorn / Atari, 1972)',
    tagline: 'The grandfather of video games: high-speed 2-player or AI rally physics.',
    category: 'physics',
    complexity: 'Beginner',
    estimatedDevTime: '1 - 2 hours',
    coreLoop: 'Keep the square ball in play between two vertical paddles; score points when opponent misses.',
    theTwist: 'Ball speed accelerates with every consecutive rally volley; curve ball spin applied based on paddle velocity.',
    keyMechanics: ['Paddle velocity transfer to ball Y angle', 'Adjustable AI difficulty (reaction delay / tracking speed)', 'First to 11 points win limit'],
    techStack: 'HTML5 Canvas + Simple Vector Reflections',
    aiStudioPrompt: `Build a modern retro Cyber Pong game in React with Canvas and Web Audio API.
Include:
1. 1-Player vs Smart AI (with Beginner, Pro, and Impossible difficulty settings) and 2-Player Local keyboard mode.
2. Realistic ball spin: moving the paddle while striking the ball alters the rebound trajectory angle.
3. Rally speedup: ball velocity increases by 3% on each consecutive bounce for intense rallies.
4. CRT vector graphics style with center dashed net and big score counters.
5. Synthesized blip sounds for paddle hits, wall bounces, and point scores.`
  },
  {
    id: 'tank-battle-1990',
    title: 'Battle Tank 1990',
    classicInspiration: 'Battle City / Tank 1990 (Namco, 1980)',
    tagline: 'Top-down tactical tank warfare with destructible brick mazes and eagle base defense.',
    category: 'topdown',
    complexity: 'Intermediate',
    estimatedDevTime: '3 - 4 hours',
    coreLoop: 'Command a green tank to destroy 20 enemy tanks per wave while guarding your headquarters eagle.',
    theTwist: 'Destructible brick walls allow carving tactical firing corridors, while steel walls deflect shells.',
    keyMechanics: ['4-way tank directional movement', 'Cannon shell collision with brick grids', 'Enemy tank AI patrol routines', 'Base HQ health point'],
    techStack: 'HTML5 Canvas 2D + Tilemap Matrix',
    aiStudioPrompt: `Develop a top-down Battle City / Tank 1990 retro game in React with TypeScript.
Key features:
1. Top-down 13x13 grid map with destructible brick blocks, indestructible iron blocks, water hazards, and ice tracks.
2. Player tank with 4-directional movement, firing ballistic shells that demolish brick walls chunk by chunk.
3. Central Phoenix / Eagle base at bottom center that must be protected from enemy shells.
4. AI enemy tanks (Regular, Fast Scout, Heavy Armor) spawning in waves from the top.
5. Dropping star power-ups: rapid fire, twin barrels, shield invulnerability, and grenade screen-clears.
6. 8-bit sound effects for engine rumble, cannon shots, and explosions.`
  },
  {
    id: 'frogger-cross',
    title: 'Highway River Hopper',
    classicInspiration: 'Frogger (Konami, 1981)',
    tagline: 'Rhythm, timing, and dodging speeding traffic and treacherous floating river logs.',
    category: 'arcade',
    complexity: 'Intermediate',
    estimatedDevTime: '2 - 3 hours',
    coreLoop: 'Hop across 5 lanes of speeding cars, then hop along floating logs and turtles to reach home lily pads.',
    theTwist: 'Turtles periodically dive underwater, leaving the frog stranded if not paying attention.',
    keyMechanics: ['Grid discrete hop movement', 'Moving vehicle rows with staggered velocities', 'Log riding velocity adherence', 'Home lily pad collection'],
    techStack: 'HTML5 Canvas + Row offset step math',
    aiStudioPrompt: `Create a Frogger-style Highway & River Crossing arcade game in React and HTML5 Canvas.
Include:
1. Discrete grid hopping movement (Up, Down, Left, Right) with hop squash-and-stretch animations.
2. Lower section: 5 traffic lanes with sedans, trucks, race cars, and bulldozers moving at varied speeds.
3. Middle resting median strip.
4. Upper section: 5 river lanes with floating wooden logs and diving turtles that move the frog horizontally.
5. 5 goal lily pads at the top; filling all 5 completes the stage and advances with faster vehicles.
6. Timer bar at bottom forcing active progression.`
  },
  {
    id: 'puzzle-2048',
    title: 'Neon 2048 Merge',
    classicInspiration: '2048 (Gabriele Cirulli, 2014)',
    tagline: 'Silky smooth exponential tile sliding and consolidation on a 4x4 matrix.',
    category: 'puzzle',
    complexity: 'Beginner',
    estimatedDevTime: '1 - 2 hours',
    coreLoop: 'Slide numbered tiles across a 4x4 grid; matching adjacent numbers merge into their double.',
    theTwist: 'Undo button, customizable grid sizes (3x3 speed mode, 4x4 classic, 5x5 endless), and neon glow palettes.',
    keyMechanics: ['2D array rotation and row compression math', 'Smooth CSS translate animations', 'Random 2/4 tile spawner', 'Win / loss validation'],
    techStack: 'React State + Framer Motion / CSS Transitions',
    aiStudioPrompt: `Build a polished 2048 sliding puzzle game in React with TypeScript and Tailwind CSS.
Features:
1. 4x4 grid with smooth animated tile translations and scale-pop effects when tiles merge.
2. Swipe touch gestures for mobile and Arrow keys / WASD for desktop.
3. Tile merging logic: rows compress, identical adjacent values merge once per move, new random '2' or '4' spawns.
4. Current Score and High Score with localStorage persistence.
5. Undo move button that steps back one state.
6. Victory modal when 2048 tile is achieved with option to continue playing indefinitely.`
  },
  {
    id: 'lunar-lander',
    title: 'Gravity Lunar Lander',
    classicInspiration: 'Lunar Lander (Atari, 1979)',
    tagline: 'Nerve-wracking propellant conservation and soft vector touchdown physics.',
    category: 'physics',
    complexity: 'Intermediate',
    estimatedDevTime: '2 - 3 hours',
    coreLoop: 'Guide a fragile lunar excursion module through gravitational pull onto designated landing pads.',
    theTwist: 'Limited fuel budget: touch down with vertical and horizontal speed under 1.5 m/s or explode on impact.',
    keyMechanics: ['Continuous gravity acceleration', 'Thrust angle vectors + fuel consumption', 'Jagged procedural terrain generator', 'Touchdown velocity threshold calculation'],
    techStack: 'HTML5 Canvas Vector Graphics + Rigid Body Physics',
    aiStudioPrompt: `Build a retro vector-style Lunar Lander physics simulator in React and HTML5 Canvas.
Specs:
1. Procedurally generated mountainous terrain with 3 flat landing zones marked with score multipliers (2x, 3x, 5x).
2. Lander physics: continuous gravity, Left/Right arrow rotation, Up arrow main thruster consuming fuel from tank.
3. Cockpit telemetry HUD: Fuel remaining, Altitude, Horizontal Speed, Vertical Speed (red/green safe descent indicator).
4. Realistic landing condition: must touch flat pad upright with horizontal and vertical speeds below safe thresholds.
5. Dramatic particle explosion if landing too hard or hitting rugged mountain walls.`
  },
  {
    id: 'bomberman-blast',
    title: 'Grid Blast Arena',
    classicInspiration: 'Bomberman (Hudson Soft, 1983)',
    tagline: 'Strategic bomb placement, crossfire explosions, and powerup hunting in a labyrinth.',
    category: 'topdown',
    complexity: 'Intermediate',
    estimatedDevTime: '3 - 4 hours',
    coreLoop: 'Drop timed bombs to vaporize soft bricks, uncover powerups, and eliminate roaming enemies.',
    theTwist: 'Chain reactions: explosions instantly detonate other bombs in their crossfire line.',
    keyMechanics: ['Pillar grid layout', 'Bomb timer and 4-way crossfire beam calculation', 'Soft block destruction & hidden item drops', 'Blast wave collision'],
    techStack: 'HTML5 Canvas or React Grid + Tile state engine',
    aiStudioPrompt: `Develop a 2D Bomberman-style grid blast action game in React and HTML5 Canvas.
Features:
1. Classic 13x11 arena with indestructible concrete pillars and destructible soft crates.
2. Spacebar to drop bombs with 2.5-second fuse, exploding in a 4-directional cross shape.
3. Explosions destroy soft crates, revealing power-ups: Flame (extends blast radius), Extra Bomb (place multiple bombs), Roller Skates (speed up).
4. Chain reactions: if an explosion hits another bomb, it detonates immediately.
5. Wandering slime enemies that eliminate the player on touch.
6. Web Audio effects for bomb drop tick, fuse sizzle, blast wave, and powerup collection.`
  }
];
