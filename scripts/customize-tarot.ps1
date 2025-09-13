param(
  [string]$Path = "tarot-cards.json"
)

if (-not (Test-Path $Path)) { Write-Error "File not found: $Path"; exit 1 }

$json = Get-Content -Raw -Path $Path | ConvertFrom-Json
if (-not $json) { Write-Error "Failed to parse JSON"; exit 1 }

function Strip-AppendedPrompts($text) {
  if (-not $text) { return $text }
  $t = [string]$text
  # Remove our previous templated add-ons
  $t = $t -replace "\s*Invitation:.*$", ""
  $t = $t -replace "\s*Course-correct:.*$", ""
  return $t.Trim()
}

$custom = @{
  thefool = @{ upright = 'A sky-wide breath before the first step. The Fool trusts the road without demanding a map. Curiosity, play, and a beginner''s heart open doors that planning can''t. Dare to learn in public and let surprise be your teacher.';
                reversed = 'Hesitation knots the laces or you bolt ahead without shoes. Fear of looking foolish or thrill-seeking for its own sake both blur the horizon. Name the risk that matters -- and the one that''s just noise -- then choose a step you can live with.' };
  themagician = @{ upright = 'Attention is a wand. The Magician gathers scattered sparks into a single flame. Skill, voice, and timing align when you commit your focus. Translate one intention into a concrete act and let momentum argue your case.';
                   reversed = 'Talent leaks when divided by distraction or bent by ego. Half-truths, shortcuts, and vanity projects dilute your craft. Return to the workbench: fewer tools, cleaner aims, honest measures.' };
  thehighpriestess = @{ upright = 'Quiet is an instrument. Behind the curtain, patterns form. The High Priestess invites you to listen between words, to trust the soft certainty in your ribs. Let the answer arrive at its own pace.';
                        reversed = 'Noise masquerades as certainty. Second-guessing drowns a subtle knowing, or secrets calcify into distance. Step back from opinions you''re borrowing. Keep one confidence with yourself and watch clarity surface.' };
  theempress = @{ upright = 'Life wants to grow through you. Warmth, art, body, and belonging take up space here. Nourish what is tender and let pleasure be a guide back to aliveness. Beauty counts as evidence.';
                 reversed = 'Care curdles into depletion when you never sip from the cup you pour. Creativity stalls under comparison and overgiving. Rest is a responsible action; receive before you resume.' };
  theemperor = @{ upright = 'A good structure is a kindness. The Emperor builds walls with windows: boundaries that let light in. Decide the rules you can keep and leadership will follow from consistency, not force.';
                 reversed = 'Control grips too hard or not at all. Rigidity smothers initiative; absence breeds confusion. Choose where to be firm and where to be human. Authority grows when it protects, not dominates.' };
  thehierophant = @{ upright = 'You stand in a long line. Tradition, lineage, and shared language can steady the hand. Learn the form so you can carry it with integrity -- or evolve it with respect.';
                     reversed = 'Dogma without soul. Outgrown roles itch until you shed them. Give yourself permission to question the script, keep what blesses, and compost the rest.' };
  thelovers = @{ upright = 'Love is a verb of alignment. Connection, choice, and values mirror back who you are becoming. Say yes with your whole voice -- or say no that frees everyone involved.';
                 reversed = 'Mixed signals tangle commitment. People-pleasing, triangles, or value drift erode trust. Choose coherence over chemistry. Let honesty do its inconvenient healing.' };
  thechariot = @{ upright = 'Direction is power made practical. Harness your drives to pull one way. Discipline becomes freedom when momentum has a purpose. Name the destination and mean it.';
                  reversed = 'Wheels spin -- either from haste or avoidance. Ego races ahead while the heart lags, or doubt cuts the engine. Realign your team of instincts before you press the pedal.' };
  strength = @{ upright = 'Gentleness with spine. Strength strokes the lion, it doesn''t cage it. Courage here looks like steady breath, soft hands, and unshaken dignity in the face of heat.';
               reversed = 'Force without tenderness breaks what it tries to protect. Or you shrink from your own power. Befriend your animal; neither muzzle nor unleash -- befriend.' };
  thehermit = @{ upright = 'Solitude becomes a lantern, not a wall. Step away to hear the true signal. Let a smaller circle and a slower pace reveal what matters.';
                 reversed = 'Isolation starts pretending to be wisdom. Hiding, ghosting, or hoarding insight keeps you stuck. Open the door a crack; share one sentence of the truth you found.' };
  wheeloffortune = @{ upright = 'Seasons turn and you turn with them. Chance favors the prepared and the flexible. Participate in your luck: say yes when the door swings open.';
                      reversed = 'White-knuckling the wheel won''t stop the weather. Stagnation, denial, or fatalism breed more of themselves. Change one habit at the hinge and let the cycle move.' };
  justice = @{ upright = 'Scales seek balance, not revenge. Consequence, context, and accountability create clean lines. Tell the whole story and act in proportion to it.';
              reversed = 'Avoided truth tilts the table. Bias, omission, or delayed decisions corrode trust. Correct the record; repair is a form of justice too.' };
  thehangedman = @{ upright = 'Surrender is not defeat. In suspension, something rearranges. See it upside down and the pattern unclenches. Patience is an active posture.';
                    reversed = 'Stuck masquerading as spiritual. Martyrdom, procrastination, or indecision keep you safely uncomfortable. Choose either sacrifice or motion -- limbo is choosing neither.' };
  death = @{ upright = 'An honest ending is a gift. Compost the old to feed the next. Grief is a teacher with clean hands; let it finish its work.';
            reversed = 'Clinging hurts more than closure. Half-goodbyes, clutter, and nostalgia jam the doorway. Make space on purpose and the new will recognize you.' };
  temperance = @{ upright = 'Alchemy in real time. Temperance blends fire and water into a third way. Measure, mix, rest, repeat. Harmony is built, not wished.';
                 reversed = 'Overcorrecting swings you into the ditch on either side. Excess or abstinence without insight miss the middle. Recalibrate in small, honest increments.' };
  thedevil = @{ upright = 'Compulsion has charisma. The Devil names the bargain: comfort at the cost of choice. Seeing the chain is step one; it often falls off when you do.';
               reversed = 'The spell thins. What owned you yesterday loses flavor today. Swap punishment for responsibility and walk out without theatrics.' };
  thetower = @{ upright = 'The facade can''t hold. Lightning delivers the truth you wouldn''t schedule. Let it fall. Rubble is honest ground to build on.';
               reversed = 'Cracks you''ve managed widen. Quiet avoidance delays a louder collapse. Initiate the repair or the exit while you still get to choose.' };
  thestar = @{ upright = 'After the storm, a clear night. The Star restores orientation with grace and slow hydration. Tender hope counts as progress.';
              reversed = 'Cynicism poses as realism. Leaks in faith or self-worth dim the view. Tend to the small light you still trust and let it scale.' };
  themoon = @{ upright = 'Dreamlight distorts and reveals. The Moon asks you to feel your way, to read tides, to respect the animal and the artist in you.';
              reversed = 'Confusion breeds stories that breed fear. Illusions, projections, and old anxieties crowd the path. Test your narrative against the body''s truth.' };
  thesun = @{ upright = 'Warmth without apology. The Sun says life is allowed to be good. Joy clarifies, vitality returns, and play sharpens your edge.';
             reversed = 'Overexposure or performative cheer dries the roots. Protect your energy; let genuine delight be private before it is public.' };
  judgment = @{ upright = 'A bell inside rings. Awakening gathers the parts of you that were waiting for a go-ahead. Answer and rise; forgiveness is a form of momentum.';
               reversed = 'Static on the line. Self-critique, avoidance, or old labels keep you small. Lay the case to rest and take the next right step.' };
  theworld = @{ upright = 'A circle closes with gratitude. Integration, mastery, and belonging meet in a simple, satisfying yes. Share what you learned by living it.';
               reversed = 'Loose ends ask for attention. Celebrate, but don''t skip the last stitch. Completion is a practice, not a mood.' };
}

foreach ($card in $json) {
  # Strip repetitive appended prompts everywhere
  if ($card.description) {
    $card.description.upright = Strip-AppendedPrompts $card.description.upright
    $card.description.reversed = Strip-AppendedPrompts $card.description.reversed
  }
  # Apply bespoke copy for majors
  if ($custom.ContainsKey($card.id)) {
    if (-not $card.description) { $card | Add-Member -NotePropertyName description -NotePropertyValue (@{}) }
    $card.description.upright = $custom[$card.id].upright
    $card.description.reversed = $custom[$card.id].reversed
  }
}

$json | ConvertTo-Json -Depth 10 | Out-File -Encoding UTF8 -FilePath $Path
Write-Host "Customized majors and removed repetitive prompts."
