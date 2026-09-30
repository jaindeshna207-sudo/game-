import { GameId, GameMetadata } from '../types/game';

import arcadeHeroImg from '../assets/images/arcade_cabinet_hero_1790751735652.jpg';
import snakeCoverImg from '../assets/images/snake_retro_cover_1790751749816.jpg';
import tetrisCoverImg from '../assets/images/tetris_retro_cover_1790751763870.jpg';
import platformerCoverImg from '../assets/images/platformer_pixel_cover_1790751776029.jpg';
import bounceCoverImg from '../assets/images/bounce_ball_cover_1790751790926.jpg';

export { arcadeHeroImg };

export const PLAYABLE_GAMES: GameMetadata[] = [
  {
    id: 'snake',
    title: 'Neon Matrix Snake',
    subtitle: 'Classic Nokia Snake with speed ramping & golden energy orbs',
    category: 'arcade',
    coverImage: snakeCoverImg,
    instructions: [
      'Steer the glowing serpent using Arrow Keys or WASD.',
      'Eat green energy pellets to grow longer and score 10 points.',
      'Grab pulsing golden fruits for 30 bonus points before they vanish!',
      'Toggle wall wraparound vs solid border in the HUD.'
    ],
    controls: {
      keyboard: ['Arrow Keys or W, A, S, D to steer', 'Space or P to Pause', 'R to Restart'],
      mobile: 'Virtual directional D-pad and Action button'
    },
    features: ['Particle eat bursts', 'Wraparound & Solid walls', 'Persistent high score', 'Dynamic speed progression']
  },
  {
    id: 'tetris',
    title: 'Tetris Block Stacker',
    subtitle: 'Standard 7 tetrominoes with ghost piece projection & hold queue',
    category: 'puzzle',
    coverImage: tetrisCoverImg,
    instructions: [
      'Rotate and maneuver falling blocks to complete horizontal lines.',
      'Use Up Arrow to rotate blocks clockwise with wall kicks.',
      'Press Space for instantaneous Hard Drop to the lowest position.',
      'Store any tricky piece in the Hold queue using the C key.'
    ],
    controls: {
      keyboard: ['Left / Right: Shift', 'Up: Rotate CW', 'Down: Soft drop', 'Space: Hard drop', 'C: Hold piece'],
      mobile: 'On-screen Rotate, Left, Right, and Hard Drop triggers'
    },
    features: ['Full 7 Tetromino types', 'Ghost piece indicator', 'Hold slot & Next preview', 'Confetti on 4-line Tetris']
  },
  {
    id: 'bounce',
    title: 'Bounce Ball / Breakout',
    subtitle: 'Angle-deflecting paddle, multi-ball, and laser blaster powerups',
    category: 'physics',
    coverImage: bounceCoverImg,
    instructions: [
      'Keep the bouncing energy sphere in play by guiding the bottom paddle.',
      'Hitting the ball toward paddle edges reflects it at steeper angles.',
      'Shatter bricks to trigger drops: Multi-Ball, Wide Paddle, and Laser Blaster.',
      'Clear all bricks to advance across 3 distinct stage layouts.'
    ],
    controls: {
      keyboard: ['Mouse Drag or Left / Right Arrows', 'Space: Fire lasers (when armed)', 'P to Pause'],
      mobile: 'Touch drag across canvas or bottom control buttons'
    },
    features: ['Deflection angle physics', '3 Powerup capsules', 'Multi-tier armored bricks', '3 Stage progressions']
  },
  {
    id: 'platformer',
    title: 'Pixel Kingdom Jumper',
    subtitle: 'Mini Mario side-scrolling platformer with stomps & mystery blocks',
    category: 'platform',
    coverImage: platformerCoverImg,
    instructions: [
      'Run and jump through a side-scrolling retro kingdom.',
      'Head-butt ? question blocks from below to bounce them and collect coins.',
      'Jump directly on top of walking creatures to squash them with a bounce.',
      'Avoid pitfalls and leap across pipes to reach the castle flagpole!'
    ],
    controls: {
      keyboard: ['A / D or Left / Right to run', 'Space or W or Up to Jump', 'P to Pause', 'R to Restart'],
      mobile: 'Left / Right touch buttons + JUMP action trigger'
    },
    features: ['Dynamic side-scrolling camera', 'Bouncy ? coin blocks', 'Goomba enemy patrol AI', 'Flagpole stage celebration']
  },
  {
    id: 'space',
    title: 'Cosmic Shield Defender',
    subtitle: 'Classic Space Invaders with bunkers, advancing fleets & UFOs',
    category: 'arcade',
    coverImage: arcadeHeroImg,
    instructions: [
      'Pilot Earth’s mobile laser cannon along the ground line.',
      'Shoot down the 5 rows of marching alien invaders before they land.',
      'Take cover behind 4 destructible green defensive bunkers.',
      'Intercept the high-speed mystery flying saucer (UFO) for huge bonus points!'
    ],
    controls: {
      keyboard: ['Left / Right Arrows or A / D to steer', 'Space to Fire plasma cannon', 'P to Pause'],
      mobile: 'Left / Right steering pad + FIRE action trigger'
    },
    features: ['5-Row marching fleet with tempo speedup', 'Pixel bunker damage', 'Mystery UFO flybys', 'Continuous alien wave escalations']
  }
];
