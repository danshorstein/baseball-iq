export interface IntroScene { narration: string; visual: string }
export interface LessonIntroContent { title: string; overview: string; scenes: IntroScene[] }
export const LESSON_INTROS: Record<string, LessonIntroContent> = {
  'cover-your-base': {
    title: 'Cover Your Base', overview: 'One player fields the ball. Teammates cover the bases and back up the throw. Before the pitch, know which job is yours.',
    scenes: [
      { narration: 'Before the pitch, every defender has a job. Start with the ball.', visual: 'Wide overhead paper baseball diamond. All defenders ready. Highlight a baseball.' },
      { narration: 'A ground ball goes to shortstop. The shortstop fields it.', visual: 'Roll the ball to SS; only SS approaches it.' },
      { narration: 'Second base is covered by the second baseman. First base stays ready.', visual: 'Move 2B to second and 1B to first. Keep the ball at SS.' },
      { narration: 'If the ball goes to second base, the shortstop covers second.', visual: 'Reset; reverse the ball side. SS covers second while 2B fields.' },
      { narration: 'Choose your job: get the ball, cover a base, or back up.', visual: 'Three cut-paper cards: BALL, BASE, BACKUP; simple arrows to field roles.' },
      { narration: 'Now try the play. Where should you go when the ball moves?', visual: 'Freeze diamond; highlight one defender. End card: YOUR TURN.' },
    ],
  },
  'back-it-up': {
    title: 'Back It Up', overview: 'A backup gets behind the intended receiver, along the throw’s path. That gives the defense another chance if the throw gets away.',
    scenes: [
      { narration: 'A good defense plans for the throw that gets away.', visual: 'Paper diamond; arrow from SS to first, ball sailing just past receiver.' },
      { narration: 'On a throw to first, right field moves behind the receiver.', visual: 'RF moves toward foul territory behind first, along the throw line.' },
      { narration: 'If the ball gets past first, the backup stops it.', visual: 'Ball rolls to RF. Label: SECOND CHANCE.' },
      { narration: 'On other throws, teammates back up third base or home plate.', visual: 'Two separate vignettes: LF behind third, P behind catcher.' },
      { narration: 'The best spot is behind the throw, with room to react.', visual: 'Show receiver, throw line, and backup separated clearly, with a small space arrow.' },
      { narration: 'Your league sets the runner rules. Your job is preventing extra bases.', visual: 'Rules card beside diamond; runner stops as backup returns the ball.' },
    ],
  },
  'get-it-in': {
    title: 'Get It In', overview: 'An outfielder gets the ball back to the infield through a cutoff or relay. A teammate backs up the outfielder while the other defenders cover bases.',
    scenes: [
      { narration: 'The ball reaches the outfield. The whole defense moves to help.', visual: 'Base hit to LF; fielders begin distinct roles.' },
      { narration: 'One outfielder gets the ball. A nearby teammate backs up.', visual: 'LF fields, CF backs up. Use one center fielder to avoid implying ten players.' },
      { narration: 'The cutoff player becomes a clear target between ball and play.', visual: 'SS aligns between LF and second. Raise simple paper-cut arms.' },
      { narration: 'Make a controlled throw to the cutoff instead of a desperate heave.', visual: 'Ball travels from LF to SS. Avoid drawing an inevitable out.' },
      { narration: 'For a deeper hit, a relay helps bring the ball back in.', visual: 'Ball farther out; relay moves deeper, then returns toward the infield.' },
      { narration: 'Listen to your teammates. Get the ball in and protect the bases.', visual: 'Catcher communication symbol; bases covered. End card: GET IT IN.' },
    ],
  },
  'hold-the-ball': {
    title: 'Hold the Ball', overview: 'A throw needs a purpose. If a runner is already safe and there is no realistic out, secure the ball and stay ready rather than making a late throw.',
    scenes: [
      { narration: 'Having the ball does not mean you must throw it.', visual: 'Infielder holds ball; runners are visibly on their bases.' },
      { narration: 'First ask: is there a realistic chance to get an out?', visual: 'Decision card: IS THERE A PLAY? Show batter already at first.' },
      { narration: 'If the runner is already safe, a late throw may only add risk.', visual: 'Hypothetical dotted wild throw; runner considers another base, no guaranteed outcome.' },
      { narration: 'Secure the ball, watch the runners, and stay ready for another play.', visual: 'Solid ball with fielder; eyes symbol toward runner; teammates remain ready.' },
      { narration: 'Holding the ball does not automatically make it dead. Follow your rules.', visual: 'LIVE BALL badge remains visible; umpire and local rules card.' },
      { narration: 'Make the next smart decision. Take a real out, or hold it.', visual: 'Two clear options: REAL OUT and NO PLAY: HOLD. End card: YOUR TURN.' },
    ],
  },
  'force-or-tag': {
    title: 'Force or Tag?', overview: 'Look at the runners and the bases behind them. A force lets a defender touch the base; without a force, the defender generally needs to tag the runner.',
    scenes: [
      { narration: 'Before you throw, ask: does this runner have to advance?', visual: 'Runner on first and batter; arrows toward first and second.' },
      { narration: 'With a runner on first, the batter makes that runner go to second.', visual: 'Highlight occupied first, batter approaching first, and runner advancing.' },
      { narration: 'For that force out, hold the ball and touch second in time.', visual: 'Defender at second with ball arrives before runner. Label: FORCE.' },
      { narration: 'With only a runner on second, there is no force at third.', visual: 'Reset: first empty, second occupied. Highlight empty first.' },
      { narration: 'To get that runner out at third, tag the runner with the ball.', visual: 'Defender’s glove with ball touches runner, distinct from touching the bag.' },
      { narration: 'A caught ball or another out can remove a force. Read the play.', visual: 'Batter out badge; advancing force arrows disappear. End card: FORCE OR TAG?' },
    ],
  },
  'call-it': {
    title: 'Call It!', overview: 'Communicate early so one player handles the ball and the others can help. These examples use the closest defender; your coach may also teach a fly-ball priority system.',
    scenes: [
      { narration: 'Two defenders can reach the ball. Clear communication keeps the play organized.', visual: 'Gap ball between two outfielders, separated with room to move.' },
      { narration: 'In this example, the closer player calls: I got it!', visual: 'Highlight closest fielder; speech bubble: I GOT IT!' },
      { narration: 'The teammate hears the call and moves behind to back up.', visual: 'Second fielder changes route behind, avoiding a collision.' },
      { narration: 'On a pop-up, listen to the call and your coach’s priority system.', visual: 'Infield pop-up; caller highlighted; other players give space.' },
      { narration: 'One player catches or fields. Everyone else still has a job.', visual: 'One ball-handler; others cover bases or back up.' },
      { narration: 'Use a loud voice, keep watching the ball, and help your teammate.', visual: 'Three icons: TALK, WATCH, HELP. End card: CALL IT.' },
    ],
  },
  'runner-on-third': {
    title: 'Runner on Third', overview: 'A runner on third makes the decision more important. Read the runner, the number of outs, and how much time you have. A fast grounder and a slowly fielded ball can call for different plays.',
    scenes: [
      { narration: 'A runner on third changes what you watch before the pitch.', visual: 'Runner on third, batter ready, infielder checks both.' },
      { narration: 'Think about the outs, the runner, and the time for a throw.', visual: 'Cards: OUTS, RUNNER, TIME. Keep legal details neutral.' },
      { narration: 'A quickly fielded grounder may give you a sure out at first.', visual: 'Fielder secures quick grounder; realistic throw window toward first.' },
      { narration: 'A slow play may leave the batter safe before you can throw.', visual: 'Batter reaches first before fielder is ready.' },
      { narration: 'Then watch the runner and avoid a late throw with no purpose.', visual: 'Fielder holds and looks toward third; runner returns to base.' },
      { narration: 'There is no answer for every grounder. Read this play and choose.', visual: 'Two contrasted play diagrams: quick fielding, slow fielding. End card: READ THE PLAY.' },
    ],
  },
  'hit-to-me': {
    title: 'It’s Hit to Me!', overview: 'Prepare before the pitch. If you field the ball, know your likely next play and who will cover the base. Adjust that plan when the ball or runners change the situation.',
    scenes: [
      { narration: 'Before the pitch, ask: if it comes to me, what is my play?', visual: 'Player in ready position; thought bubble with ball and base.' },
      { narration: 'A grounder to the pitcher often means a controlled throw to first.', visual: 'Comebacker; P fields, 1B covers, RF backs up.' },
      { narration: 'A slow roller to the catcher can mean the pitcher covers home.', visual: 'C fields near plate; P moves to home, first ready.' },
      { narration: 'If first base fields near the bag, stepping on first may work.', visual: '1B fields near bag and carries ball to touch base.' },
      { narration: 'If first base moves away, the pitcher may cover for the throw.', visual: '1B off bag; P covers first and receives toss.' },
      { narration: 'Know your team’s plan, then adjust to the ball and the runners.', visual: 'All defenders ready. End card: THINK BEFORE THE PITCH.' },
    ],
  },
};
