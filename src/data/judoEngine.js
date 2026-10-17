// src/data/judoEngine.js
// Système de Préparation Physique Spécifique Judo - Niveau Équipe Nationale
// 3 Mois d'entraînement progressif avec Barre de Traction, Sac à dos (5 kg max) et Élastique de musculation.

const STORAGE_KEY = 'pos_judo_state_v1';

export const JUDO_PROGRAM_DATA = {
  months: [
    {
      id: 1,
      title: 'Mois 1 : Fondation, Densité & Force Fonctionnelle',
      subtitle: 'Construction des fondations musculaires, renforcement de la poigne (kumi-kata) et apprentissage du tempo strict (3-0-1-0).',
      objective: 'Accumuler du volume de travail propre, blinder les tendons et initier la prise de masse vers 60 kg.',
      weeks: [
        {
          weekNumber: 1,
          focus: 'Semaine 1 : Calibration & Tempo strict',
          sessions: [
            {
              id: 'm1_w1_s1',
              title: 'Séance 1 : Tirage Lourd & Kumi-Kata Pro',
              type: 'pull',
              durationMin: 55,
              targetMuscle: 'Grand dorsal, avant-bras, trapèzes, biceps',
              judoContext: 'Développe la force de déséquilibre (Kuzushi) et une saisie impossible à arracher en randori.',
              exercises: [
                {
                  id: 'ex_m1_w1_s1_1',
                  name: 'Tractions Strictes (Sac à dos 5 kg)',
                  sets: 4,
                  reps: '6 à 8 reps',
                  tempo: '3-0-1-0 (3s descente)',
                  rest: '120s',
                  equipment: 'Barre + Sac 5 kg',
                  cue: 'Verrouille les omoplates vers le bas avant de tirer. Menton au-dessus de la barre sans balancer les jambes.',
                  judoImpact: 'Puissance de tirage vertical pour briser la posture adverse.',
                  imageUrl: '/judo/ex_tractions_strictes.jpg',
                  steps: {
                    start: 'Suspendu à la barre en pronation (mains vers l’avant), bras tendus, omoplates tirées vers le bas.',
                    movement: 'Tire avec les dorsaux en amenant les coudes vers le bas et l’arrière jusqu’à dépasser la barre du menton.',
                    finish: 'Contrôle la descente en 3 secondes complètes sans relâcher la tension des épaules.'
                  },
                  avoidMistake: 'Ne donne pas d’à-coups avec les jambes ou les genoux (kipping interdit).'
                },
                {
                  id: 'ex_m1_w1_s1_2',
                  name: 'Tractions Kumi-Kata (Serviette ou Veste de Kimono)',
                  sets: 3,
                  reps: '5 à 8 reps',
                  tempo: '2-1-1-0',
                  rest: '90s',
                  equipment: 'Barre + Serviette/Kimono',
                  cue: 'Enroule le tissu autour de la barre, serre les poings comme pour un revers et tire en force.',
                  judoImpact: 'Endurance isométrique des fléchisseurs des doigts (saisie indéboulonnable).',
                  imageUrl: '/judo/ex_tractions_kumi_kata.jpg',
                  steps: {
                    start: 'Deux serviettes ou ta veste de kimono jetées sur la barre. Empoigne le tissu à pleine main.',
                    movement: 'Serre la poigne à 100% et hisse ton torse jusqu’à la hauteur des mains.',
                    finish: 'Redescends avec contrôle sans ouvrir les doigts ni glisser.'
                  },
                  avoidMistake: 'Ne laisse pas le tissu glisser : la préhension doit être verrouillée comme une saisie de revers.'
                },
                {
                  id: 'ex_m1_w1_s1_3',
                  name: 'Uchi-Komi Élastique Vitesse Haute Fréquence (Seoi / Morote)',
                  sets: 4,
                  reps: '25 reps explosives (15 droite / 10 gauche)',
                  tempo: 'Explosif 1-0-1-0',
                  rest: '60s',
                  equipment: 'Élastique ancré à hauteur d’épaule',
                  cue: 'Tirage coudes hauts, rotation ultra-rapide des hanches sous le centre de gravité.',
                  judoImpact: 'Vitesse d’entrée en compétition (Tsukuri).',
                  imageUrl: '/judo/ex_uchi_komi.jpg',
                  steps: {
                    start: 'Élastique ancré face à toi à hauteur de poitrine, saisis les deux poignées en garde droite ou gauche.',
                    movement: 'Tire fort manche et revers vers le haut tout en pivotant instantanément tes hanches et tes pieds à 180° sous la bande.',
                    finish: 'Fléchis les genoux en position de projection puis reviens d’un bond en position initiale.'
                  },
                  avoidMistake: 'Ne tire pas les bras mous : les coudes doivent monter hauts et le bassin doit tourner avant le buste.'
                },
                {
                  id: 'ex_m1_w1_s1_4',
                  name: 'Rowing Sac à dos 5 kg Buste Penché (Unilatéral)',
                  sets: 3,
                  reps: '12 reps par bras',
                  tempo: '2-1-1-1 (1s blocage en haut)',
                  rest: '60s',
                  equipment: 'Sac 5 kg',
                  cue: 'Dos parfaitement plat à 45°, tire le coude vers la hanche sans tourner le buste.',
                  judoImpact: 'Épaisseur du dos pour résister aux tractions adverses.',
                  imageUrl: '/judo/ex_rowing_unilateral.jpg',
                  steps: {
                    start: 'En appui d’une main sur une chaise ou en fente, buste penché à 45°, dos plat, sac tenu à bout de bras.',
                    movement: 'Tire le sac vers ta hanche en resserrant l’omoplate et en gardant le coude près du corps.',
                    finish: 'Bloque 1 seconde en contraction maximale avant de redescendre lentement.'
                  },
                  avoidMistake: 'N’arrondis jamais le bas du dos et ne pivote pas le buste pour tricher.'
                },
                {
                  id: 'ex_m1_w1_s1_5',
                  name: 'Face-Pulls à l’Élastique (Coudes Ouverts)',
                  sets: 3,
                  reps: '15 à 20 reps',
                  tempo: '2-0-1-1',
                  rest: '60s',
                  equipment: 'Élastique',
                  cue: 'Tire la bande vers les tempes en écartant les coudes, resserre fort les omoplates.',
                  judoImpact: 'Blindage de la coiffe des rotateurs (prévention blessures).',
                  imageUrl: '/judo/ex_face_pulls.jpg',
                  steps: {
                    start: 'Élastique fixé à hauteur des yeux, bras tendus devant toi, paumes tournées vers le sol.',
                    movement: 'Tire la bande vers tes tempes ou ton front en ouvrant les coudes très hauts et vers l’extérieur.',
                    finish: 'Contracte fort les deltoïdes arrière et les rhomboïdes 1 seconde avant de revenir.'
                  },
                  avoidMistake: 'Ne garde pas les coudes sous les épaules : ils doivent rester plus hauts que les poignets.'
                },
                {
                  id: 'ex_m1_w1_s1_6',
                  name: 'Suspension Isométrique Kimono / Barre (Dead Hang)',
                  sets: 3,
                  reps: 'Temps max (viser 40 à 50s)',
                  tempo: 'Maintien continu',
                  rest: '90s',
                  equipment: 'Barre + Kimono / Serviette',
                  cue: 'Suspends-toi uniquement par la force de préhension des doigts.',
                  judoImpact: 'Résistance à la fatigue des avant-bras en fin de match.',
                  imageUrl: '/judo/ex_tractions_commando.jpg',
                  steps: {
                    start: 'Agrippe le kimono ou la serviette enroulée sur la barre, pieds décollés du sol.',
                    movement: 'Reste suspendu avec les abdominaux gainés et les omoplates actives (pas d’épaules dans le cou).',
                    finish: 'Maintiens jusqu’à la brûlure totale des avant-bras avant de poser les pieds.'
                  },
                  avoidMistake: 'Ne laisse pas tes épaules se désengager complètement sous la charge.'
                },
                {
                  id: 'ex_m1_w1_s1_7',
                  name: 'Curl Poignets à l’Élastique (Force de Poigne & Kumi-Kata)',
                  sets: 3,
                  reps: '20 reps par poignet',
                  tempo: '2-0-1-1 (1s blocage en flexion)',
                  rest: '60s',
                  equipment: 'Élastique ancré sous le pied',
                  cue: 'Avant-bras calé à plat sur la cuisse, fléchis le poignet au maximum contre la résistance élastique.',
                  judoImpact: 'Solidité et puissance des fléchisseurs pour verrouiller le revers adverse.',
                  imageUrl: '/judo/ex_curl_poignet.jpg',
                  steps: {
                    start: 'Assis sur une chaise, avant-bras posé sur la cuisse, poignet dépassant du genou, bande tendue sous le pied.',
                    movement: 'Enroule le poignet vers le haut en contractant les fléchisseurs de l’avant-bras à 100%.',
                    finish: 'Contrôle la descente complète sans relâcher la tension.'
                  },
                  avoidMistake: 'Ne soulève pas l’avant-bras de ta cuisse : seul le poignet doit bouger.'
                }
              ]
            },
            {
              id: 'm1_w1_s2',
              title: 'Séance 2 : Moteur Hanches, Cuisses & Ancrage',
              type: 'legs',
              durationMin: 50,
              targetMuscle: 'Fessiers, quadriceps, ischio-jambiers, adducteurs',
              judoContext: 'Bâtit un ancrage au sol indestructible pour résister aux fauchages et exploser sur les techniques d’épaule.',
              exercises: [
                {
                  id: 'ex_m1_w1_s2_1',
                  name: 'Squats Bulgares (Pied arrière surélevé + Sac 5 kg)',
                  sets: 4,
                  reps: '8 à 10 reps par jambe',
                  tempo: '3-1-1-0 (3s descente, 1s pause en bas)',
                  rest: '90s',
                  equipment: 'Sac 5 kg + Chaise/Banc',
                  cue: 'Genou avant aligné avec le pied, descente profonde sans toucher le sol. Pousse fort sur le talon.',
                  judoImpact: 'Force unilatérale monstrueuse pour les attaques à une jambe (Uchi-mata, Harai-goshi).',
                  imageUrl: '/judo/ex_squats_bulgares.jpg',
                  steps: {
                    start: 'Un pied posé sur une chaise derrière toi, sac 5 kg sur le dos, pied avant fermement ancré.',
                    movement: 'Fléchis la jambe avant pour descendre le genou arrière vers le sol en 3 secondes lentes.',
                    finish: 'Pousse sur le talon avant pour remonter avec puissance et verrouiller la hanche.'
                  },
                  avoidMistake: 'Le genou avant ne doit pas s’effondrer vers l’intérieur lors de la remontée.'
                },
                {
                  id: 'ex_m1_w1_s2_2',
                  name: 'Good Mornings à l’Élastique (Chaîne Postérieure)',
                  sets: 4,
                  reps: '12 à 15 reps',
                  tempo: '3-0-1-0',
                  rest: '75s',
                  equipment: 'Élastique sous les pieds et nuque',
                  cue: 'Pousse les fesses en arrière en gardant le dos droit, extension complète des hanches en contractant les fessiers.',
                  judoImpact: 'Extension des hanches pour décoller l’adversaire lors des projections arrières.',
                  imageUrl: '/judo/ex_good_mornings.jpg',
                  steps: {
                    start: 'Pieds sur la bande élastique, l’autre extrémité passée derrière la nuque sur les trapèzes, dos droit.',
                    movement: 'Pousse le bassin vers l’arrière en gardant les genoux légèrement fléchis et le dos parfaitement droit.',
                    finish: 'Contracte puissamment les fessiers et les ischios pour ramener le bassin en avant.'
                  },
                  avoidMistake: 'N’arrondis jamais le dos : le mouvement est une bascule pure des hanches.'
                },
                {
                  id: 'ex_m1_w1_s2_3',
                  name: 'Cossack Squats Profonds (Sac 5 kg tenu sur la poitrine)',
                  sets: 3,
                  reps: '8 reps par côté',
                  tempo: '2-1-1-0',
                  rest: '60s',
                  equipment: 'Sac 5 kg tenu en Goblet',
                  cue: 'Pieds très écartés, descends très bas sur un talon, jambe opposée tendue pied flex. Garde le buste droit.',
                  judoImpact: 'Mobilité active et force des adducteurs pour les positions basses de défense.',
                  imageUrl: '/judo/ex_fentes.jpg',
                  steps: {
                    start: 'Pieds très largement écartés, sac 5 kg serré contre le sternum, buste redressé.',
                    movement: 'Descends tout ton bassin sur un talon en pliant le genou, la jambe opposée reste tendue sur le talon.',
                    finish: 'Pousse sur la jambe fléchie pour remonter et basculer de l’autre côté.'
                  },
                  avoidMistake: 'Ne décolle pas le talon d’appui : le pied de la jambe pliée doit rester à plat au sol.'
                },
                {
                  id: 'ex_m1_w1_s2_4',
                  name: 'Fentes Sautées Explosives (Pliométrie)',
                  sets: 3,
                  reps: '12 sauts dynamiques alternés',
                  tempo: 'Explosif maximal',
                  rest: '75s',
                  equipment: 'Poids de corps',
                  cue: 'Explosion verticale maximale, amorti souple sur l’avant du pied.',
                  judoImpact: 'Taux de développement de force (RFD) pour surprendre l’adversaire.',
                  imageUrl: '/judo/ex_fentes.jpg',
                  steps: {
                    start: 'En fente basse au sol, bras en garde de combat.',
                    movement: 'Pousse violemment sur tes deux pieds pour sauter le plus haut possible.',
                    finish: 'Intervertis tes jambes en plein vol et amortis souple directement en fente opposée.'
                  },
                  avoidMistake: 'Amortis en douceur, ne laisse pas le genou arrière percuter le sol dur.'
                },
                {
                  id: 'ex_m1_w1_s2_5',
                  name: 'Relevés de Genoux / Jambes Suspendu à la Barre',
                  sets: 4,
                  reps: '10 à 12 reps strictes',
                  tempo: '2-0-1-1',
                  rest: '60s',
                  equipment: 'Barre de traction',
                  cue: 'Monte les genoux aux coudes sans cambrer ni balancer le bassin.',
                  judoImpact: 'Compression abdominale pour le combat au sol (Ne-waza) et garde fermée.',
                  imageUrl: '/judo/ex_releves_genoux.jpg',
                  steps: {
                    start: 'Suspendu à la barre bras tendus, corps parfaitement immobile.',
                    movement: 'Enroule le bassin en montant les genoux ou pointes de pieds vers la poitrine.',
                    finish: 'Bloque 1 seconde en haut puis redescends en contrôlant sans aucun balancier.'
                  },
                  avoidMistake: 'Ne balance pas tes jambes d’avant en arrière pour t’aider de l’élan.'
                }
              ]
            },
            {
              id: 'm1_w1_s3',
              title: 'Séance 3 : Poussée, Cadres Défensifs & Gainage Anti-Rotation',
              type: 'push_core',
              durationMin: 50,
              targetMuscle: 'Pectoraux, triceps, deltoïdes, obliques, transverse',
              judoContext: 'Crée des cadres infranchissables pour repousser les saisies et verrouille le buste contre les torsions.',
              exercises: [
                {
                  id: 'ex_m1_w1_s3_1',
                  name: 'Pompes Lestées avec Sac à dos 5 kg',
                  sets: 4,
                  reps: '10 à 12 reps',
                  tempo: '3-0-1-0 (3s descente contrôlée)',
                  rest: '90s',
                  equipment: 'Sac 5 kg',
                  cue: 'Gainage parfait, poitrine qui effleure le sol, verrouillage des coudes en haut en poussant le sol.',
                  judoImpact: 'Puissance de poussée pour repousser l’adversaire hors de sa garde.',
                  imageUrl: '/judo/ex_pompes.jpg',
                  steps: {
                    start: 'En planche haute, sac 5 kg serré sur le dos, mains sous les épaules, abdos contractés.',
                    movement: 'Descends la poitrine à 2 cm du sol en gardant les coudes à 45° du corps.',
                    finish: 'Pousse le sol avec explosion pour revenir en planche haute.'
                  },
                  avoidMistake: 'Ne laisse pas le bassin s’affaisser, garde le corps droit comme une poutre.'
                },
                {
                  id: 'ex_m1_w1_s3_2',
                  name: 'Dips au Poids de Corps (Entre 2 chaises solides)',
                  sets: 3,
                  reps: '8 à 12 reps',
                  tempo: '2-1-1-0',
                  rest: '75s',
                  equipment: 'Chaises / Mobilier stable',
                  cue: 'Descente jusqu’à 90° au coude, pousse fort sans hausser les épaules.',
                  judoImpact: 'Triceps puissants pour verrouiller les avant-bras sur le judogi.',
                  imageUrl: '/judo/ex_dips.jpg',
                  steps: {
                    start: 'Mains en appui sur deux chaises stables, torse droit, bras tendus.',
                    movement: 'Fléchis les coudes en descendant le corps jusqu’à atteindre un angle de 90° aux coudes.',
                    finish: 'Repousse fermement avec les paumes pour remonter en extension complète.'
                  },
                  avoidMistake: 'Ne descends pas trop bas pour éviter les tensions excessives sur les épaules.'
                },
                {
                  id: 'ex_m1_w1_s3_3',
                  name: 'Pallof Press à l’Élastique (Gainage Anti-Rotation)',
                  sets: 3,
                  reps: '12 reps par côté (3s de blocage bras tendus)',
                  tempo: '1-3-1-0',
                  rest: '60s',
                  equipment: 'Élastique ancré sur le côté',
                  cue: 'Buste droit, pieds ancrés largeur d’épaules. Pousse la bande droit devant toi sans laisser le buste tourner.',
                  judoImpact: 'Stabilité anti-torsion pour ne pas se faire dévier par les feintes de garde.',
                  imageUrl: '/judo/ex_pallof_press.jpg',
                  steps: {
                    start: 'De profil par rapport au point d’ancrage, élastique tenu à deux mains contre le sternum.',
                    movement: 'Pousse les mains droit devant toi en tendant les bras et en résistant à la rotation.',
                    finish: 'Maintiens 3 secondes bras tendus puis ramène doucement les mains à la poitrine.'
                  },
                  avoidMistake: 'Ne laisse pas tes hanches ou ton buste tourner vers l’élastique : reste parfaitement de face.'
                },
                {
                  id: 'ex_m1_w1_s3_4',
                  name: 'Rotations de Buste Explosives à l’Élastique (Woodchoppers)',
                  sets: 3,
                  reps: '15 reps par côté',
                  tempo: 'Explosif 1-0-1-0',
                  rest: '60s',
                  equipment: 'Élastique',
                  cue: 'Pivote les hanches et le tronc d’un coup sec en amenant l’élastique en diagonale.',
                  judoImpact: 'Transfert d’énergie rotatif spécifique au fauchage et à la hanche (O-goshi).',
                  imageUrl: '/judo/ex_pallof_press.jpg',
                  steps: {
                    start: 'Pieds écartés largeur d’épaules, tiens l’élastique à deux mains en diagonale.',
                    movement: 'Pivote les hanches, le pied arrière et le tronc avec violence pour projeter la bande en diagonale opposée.',
                    finish: 'Contrôle le retour et réarme aussitôt pour la répétition suivante.'
                  },
                  avoidMistake: 'Ne tire pas seulement avec les bras : c’est la rotation du bassin qui génère la puissance.'
                },
                {
                  id: 'ex_m1_w1_s3_5',
                  name: 'Pompes Pique (Pike Push-ups pieds ou sol)',
                  sets: 3,
                  reps: '8 à 10 reps',
                  tempo: '2-0-1-0',
                  rest: '60s',
                  equipment: 'Poids de corps',
                  cue: 'Fesses en l’air en V inversé, descends le haut de la tête vers l’avant.',
                  judoImpact: 'Deltoïdes antérieurs et trapèzes renforcés contre les chutes.',
                  imageUrl: '/judo/ex_pompes.jpg',
                  steps: {
                    start: 'Mains et pieds au sol, bassin monté vers le plafond pour former un V inversé.',
                    movement: 'Fléchis les bras en amenant le sommet de ta tête vers l’avant du sol entre tes mains.',
                    finish: 'Pousse sur les épaules pour remonter et retrouver la position de V inversé.'
                  },
                  avoidMistake: 'Ne garde pas les coudes collés aux oreilles, oriente-les à 45° vers l’arrière.'
                },
                {
                  id: 'ex_m1_w1_s3_6',
                  name: 'Hollow Body Hold (Bateau Gainé)',
                  sets: 3,
                  reps: '45 secondes',
                  tempo: 'Isométrique',
                  rest: '45s',
                  equipment: 'Tapis / Sol',
                  cue: 'Bas du dos plaqué au sol, bras et jambes décollés tendus.',
                  judoImpact: 'Solidité du tronc lors des retournements au sol.',
                  imageUrl: '/judo/ex_gainage_hollow.jpg',
                  steps: {
                    start: 'Allongé sur le dos, bas du dos fermement écrasé dans le sol (aucun jour sous les lombaires).',
                    movement: 'Décolle les omoplates et les jambes tendues à 20 cm du sol, bras tendus le long des oreilles.',
                    finish: 'Respire calmement tout en maintenant la tension continue dans les abdominaux.'
                  },
                  avoidMistake: 'Si ton bas du dos se décolle du sol, remonte un peu les jambes pour protéger tes vertèbres.'
                }
              ]
            },
            {
              id: 'm1_w1_s4',
              title: 'Routine Quotidienne : Mobilité Articulaire & Déverrouillage Hanches/Épaules',
              type: 'mobility',
              durationMin: 15,
              targetMuscle: 'Capsules articulaires, hanches, chevilles, cage thoracique',
              judoContext: 'Fluidifie les pivots (Tai-sabaki) et protège les articulations des traumatismes de combat.',
              exercises: [
                {
                  id: 'ex_m1_w1_s4_1',
                  name: 'Shin-Box (Hanches 90-90) sans les mains',
                  sets: 3,
                  reps: '10 rotations fluides alternées',
                  tempo: 'Contrôlé',
                  rest: '30s',
                  equipment: 'Sol',
                  cue: 'Assis au sol, passe d’un côté à l’autre en gardant le dos droit.',
                  judoImpact: 'Rotation interne et externe des têtes de fémur pour les esquives.',
                  imageUrl: '/judo/ex_mobilite_sol.jpg',
                  steps: {
                    start: 'Assis au sol, genou avant à 90°, jambe arrière à 90° (position Shin-Box 90/90).',
                    movement: 'Sans poser les mains au sol, fais basculer tes deux genoux vers le côté opposé.',
                    finish: 'Grandis-toi sur chaque rotation pour bien ouvrir les fléchisseurs de hanches.'
                  },
                  avoidMistake: 'Ne t’arrondis pas en avant, garde la poitrine fière.'
                },
                {
                  id: 'ex_m1_w1_s4_2',
                  name: 'Cossack Squats Dynamiques Poids de Corps',
                  sets: 2,
                  reps: '8 reps par jambe',
                  tempo: 'Fluide',
                  rest: '30s',
                  equipment: 'Sol',
                  cue: 'Descente lente et fluide, pointe de pied levée.',
                  judoImpact: 'Élasticité des adducteurs pour les attaques grand angle.',
                  imageUrl: '/judo/ex_fentes.jpg',
                  steps: {
                    start: 'Debout jambes très écartées, mains jointes devant le torse.',
                    movement: 'Glisse ton bassin d’un côté en descendant très bas, la jambe opposée reste tendue pied flex.',
                    finish: 'Remonte au centre et bascule avec fluidité sur l’autre jambe.'
                  },
                  avoidMistake: 'Garde le genou fléchi bien aligné avec les orteils.'
                },
                {
                  id: 'ex_m1_w1_s4_3',
                  name: 'Dislocations d’Épaules à l’Élastique',
                  sets: 3,
                  reps: '15 passages complets',
                  tempo: 'Contrôlé',
                  rest: '30s',
                  equipment: 'Élastique',
                  cue: 'Bras tendus, passe l’élastique de l’avant vers l’arrière sans à-coups.',
                  judoImpact: 'Libère la ceinture scapulaire et évite les tendinites d’arrachage.',
                  imageUrl: '/judo/ex_dislocations_epaules.jpg',
                  steps: {
                    start: 'Tiens l’élastique devant toi avec une prise large, bras tendus.',
                    movement: 'Fais passer l’élastique au-dessus de la tête jusqu’aux fessiers sans plier les bras.',
                    finish: 'Reviens vers l’avant dans le même mouvement fluide et continu.'
                  },
                  avoidMistake: 'Ne force pas si tes épaules bloquent : écarte simplement les mains davantage sur l’élastique.'
                },
                {
                  id: 'ex_m1_w1_s4_4',
                  name: 'Pont Japonais & Extension Thoracique',
                  sets: 2,
                  reps: '8 reps lentes par côté',
                  tempo: 'Contrôlé',
                  rest: '30s',
                  equipment: 'Sol',
                  cue: 'Pousse sur les talons et les épaules pour former un arc puissant.',
                  judoImpact: 'Sorties de projection et pontages sous immobilisation.',
                  imageUrl: '/judo/ex_mobilite_sol.jpg',
                  steps: {
                    start: 'Allongé sur le dos, genoux pliés, pieds à plat près des fessiers.',
                    movement: 'Pousse sur les talons pour projeter le bassin très haut et viens toucher le sol derrière avec un bras tendu en diagonale.',
                    finish: 'Redescends avec contrôle et alterne de l’autre côté.'
                  },
                  avoidMistake: 'Pousse avec les fessiers et les jambes, ne force pas sur la nuque.'
                }
              ]
            }
          ]
        },
        {
          weekNumber: 2,
          focus: 'Semaine 2 : Montée en Volume & Rythme Cardiovasculaire',
          sessionModifiers: 'Ajout de +2 reps sur les tractions et +5 Uchi-komi par série.'
        },
        {
          weekNumber: 3,
          focus: 'Semaine 3 : Densité & Réduction des Temps de Repos',
          sessionModifiers: 'Temps de repos réduits de 15s sur tous les exercices de tirage et de poussée.'
        },
        {
          weekNumber: 4,
          focus: 'Semaine 4 : Test de Puissance & Bilan Mois 1',
          sessionModifiers: 'Série maximale sur les tractions kumi-kata et test de vitesse 30s Uchi-komi.'
        }
      ]
    },
    {
      id: 2,
      title: 'Mois 2 : Surcharge Biomécanique, Isométrie & Explosion',
      subtitle: 'La charge du sac restant à 5 kg max, la surcharge se fait par les leviers (unilatéral, pauses 3s) et l’accélération explosive.',
      objective: 'Développer une force explosive foudroyante et consolider le gain de poids (viser 57-58 kg).',
      weeks: [
        {
          weekNumber: 5,
          focus: 'Semaine 5 : Isométrie & Pauses de Contraction (3s en bas)',
          sessionModifiers: '3 secondes de pause isométrique au point le plus bas de chaque rep.'
        },
        {
          weekNumber: 6,
          focus: 'Semaine 6 : Accélération & Pliométrie Judo',
          sessionModifiers: 'Tractions explosives (poitrine à la barre) + Fentes sautées dynamiques.'
        },
        {
          weekNumber: 7,
          focus: 'Semaine 7 : Uchi-Komi Haute Tension (Élastique doublé)',
          sessionModifiers: 'Élastique doublé pour une résistance de tirage maximale simulant un adversaire lourd.'
        },
        {
          weekNumber: 8,
          focus: 'Semaine 8 : Simulation de Match (4 Minutes de Pression Continue)',
          sessionModifiers: 'Circuits enchaînés sans pause simulant un temps réglementaire de randori national.'
        }
      ]
    },
    {
      id: 3,
      title: 'Mois 3 : Rythme Équipe Nationale, Endurance de Puissance & Peaking',
      subtitle: 'Conditionnement d’athlète d’élite. Combinaison de vitesse pure, de résistance lactique et de puissance finale.',
      objective: 'Atteindre le poids de forme optimal (60.0 kg affûté) et être prêt à dominer physiquement les sélections nationales.',
      weeks: [
        {
          weekNumber: 9,
          focus: 'Semaine 9 : Complexes Polyarticulaires enchaînés',
          sessionModifiers: 'Supersets tractions kumi-kata + pompes lestées sac 5 kg.'
        },
        {
          weekNumber: 10,
          focus: 'Semaine 10 : Vitesse Maximale sous Fatigue',
          sessionModifiers: 'Séries de 40 uchi-komi en fin de séance sous fatigue.'
        },
        {
          weekNumber: 11,
          focus: 'Semaine 11 : Puissance Maximale & Poigne Indéboulonnable',
          sessionModifiers: 'Tractions 1 bras assisté serviette + Suspensions serviette 1 minute.'
        },
        {
          weekNumber: 12,
          focus: 'Semaine 12 : Peaking & État de Grâce Compétition',
          sessionModifiers: 'Maintien de la vitesse pure, fraîcheur musculaire et validation de l’objectif 60 kg.'
        }
      ]
    }
  ]
};

// Obtenir l'état de sauvegarde du judo
export const getJudoState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Erreur lecture judoState:', e);
  }

  // État initial par défaut
  return {
    currentWeight: 55.0,
    targetWeight: 60.0,
    currentMonth: 1,
    currentWeek: 1,
    weightLogs: [
      { date: new Date().toISOString().split('T')[0], weight: 55.0 }
    ],
    completedExercises: {}, // { [sessionId]: [exId1, exId2] }
    sessionRatings: {},     // { [sessionId]: { score: 9, rpe: 8, notes: "Excellente poigne...", completedAt: "..." } }
    totalMinutesTrained: 0,
    history: []
  };
};

export const saveJudoState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Erreur sauvegarde judoState:', e);
  }
};

// Basculer la validation d'un exercice dans une séance
export const toggleExerciseCompletion = (sessionId, exerciseId) => {
  const state = getJudoState();
  const currentList = state.completedExercises[sessionId] || [];
  
  let updatedList;
  if (currentList.includes(exerciseId)) {
    updatedList = currentList.filter(id => id !== exerciseId);
  } else {
    updatedList = [...currentList, exerciseId];
  }

  state.completedExercises[sessionId] = updatedList;
  saveJudoState(state);
  return state;
};

// Enregistrer la note et l'évaluation d'une séance
export const recordSessionRating = (sessionId, { score, rpe, notes }) => {
  const state = getJudoState();
  const now = new Date().toISOString();
  
  state.sessionRatings[sessionId] = {
    score: Number(score) || 8,
    rpe: Number(rpe) || 8,
    notes: notes || '',
    completedAt: now
  };

  // Ajout à l'historique
  const existingIdx = state.history.findIndex(h => h.sessionId === sessionId);
  const historyEntry = {
    sessionId,
    score: Number(score) || 8,
    rpe: Number(rpe) || 8,
    notes: notes || '',
    completedAt: now,
    exercisesCompletedCount: (state.completedExercises[sessionId] || []).length
  };

  if (existingIdx >= 0) {
    state.history[existingIdx] = historyEntry;
  } else {
    state.history.unshift(historyEntry);
  }

  saveJudoState(state);
  return state;
};

// Enregistrer une pesée
export const logAthleteWeight = (weightKg) => {
  const state = getJudoState();
  const val = parseFloat(weightKg);
  if (isNaN(val) || val <= 0) return state;

  state.currentWeight = val;
  const today = new Date().toISOString().split('T')[0];
  
  // Éviter les doublons du même jour
  const filtered = state.weightLogs.filter(w => w.date !== today);
  filtered.push({ date: today, weight: val });
  state.weightLogs = filtered;

  saveJudoState(state);
  return state;
};

// Calculer les statistiques globales
export const getJudoKPIs = (state) => {
  const currentState = state || getJudoState();
  const totalSessions = Object.keys(currentState.sessionRatings).length;
  
  let avgScore = 0;
  if (totalSessions > 0) {
    const sum = Object.values(currentState.sessionRatings).reduce((acc, curr) => acc + (curr.score || 0), 0);
    avgScore = (sum / totalSessions).toFixed(1);
  }

  const weightProgressKg = (currentState.currentWeight - 55.0).toFixed(1);
  const remainingWeightKg = (currentState.targetWeight - currentState.currentWeight).toFixed(1);
  const weightPercent = Math.min(100, Math.max(0, ((currentState.currentWeight - 55.0) / (60.0 - 55.0)) * 100)).toFixed(0);

  return {
    totalSessions,
    avgScore: totalSessions > 0 ? avgScore : '—',
    currentWeight: currentState.currentWeight,
    targetWeight: currentState.targetWeight,
    weightProgressKg,
    remainingWeightKg,
    weightPercent: Number(weightPercent),
    historyCount: currentState.history.length
  };
};
