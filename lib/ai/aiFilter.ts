export type AIFilterResult =
    | { ok: true }
    | { ok: false; error: string };

const DEFAULT_FOUL_MESSAGE = "This is a foul! We only talk football here.";

export function aiFilter(input: string, foulMessage: string = DEFAULT_FOUL_MESSAGE): AIFilterResult {
    const text = (input ?? "").toLowerCase().trim();

    if (!text) {
        return { ok: false, error: foulMessage };
    }

    const footballKeywords = [
        // Genel
        "football", "soccer", "futbol", "match", "fixture", "derby", "derbies",
        "goal", "gol", "penalty", "penaltı", "offside", "ofsayt", "corner", "korner",
        "foul", "faul", "card", "kart", "red card", "yellow card", "var", "referee",
        "hakem", "ball", "top", "pitch", "saha", "stadium", "stadyum", "season", "sezon",
        
        // Organizasyonlar
        "uefa", "fifa", "conmebol", "caf", "afc", "concacaf", "ofc",
        
        // Şampiyonalar & Turnuvalar
        "ucl", "uel", "uecl", "champions league", "europa league", "conference league",
        "world cup", "euro", "euros", "copa america", "copa libertadores", "afcon",
        "club world cup", "super cup", "qualifiers", "qualifier", "playoff", "final",
        
        // Ligler (Avrupa)
        "premier league", "epl", "la liga", "serie a", "bundesliga", "ligue 1",
        "eredivisie", "primeira liga", "championship", "segunda division",
        "super lig", "süper lig", "scottish premiership", "jupiler pro league",
        
        // Büyük Kulüpler (İngiltere)
        "manchester united", "man utd", "man united", "liverpool", "chelsea",
        "arsenal", "manchester city", "man city", "tottenham", "spurs",
        "everton", "leicester", "west ham", "aston villa", "newcastle",
        
        // Büyük Kulüpler (İspanya)
        "real madrid", "realmadrid", "madrid", "barcelona", "barca", "barça",
        "atletico madrid", "atleti", "sevilla", "valencia", "athletic bilbao",
        "villarreal", "real sociedad", "betis", "el clasico", "clasico",
        
        // Büyük Kulüpler (İtalya)
        "juventus", "juve", "inter", "inter milan", "ac milan", "milan",
        "napoli", "roma", "lazio", "atalanta", "fiorentina", "torino",
        "derby della madonnina", "derby d'italia",
        
        // Büyük Kulüpler (Almanya)
        "bayern munich", "bayern", "borussia dortmund", "dortmund", "bvb",
        "rb leipzig", "leipzig", "bayer leverkusen", "leverkusen", "schalke",
        "frankfurt", "wolfsburg", "monchengladbach", "der klassiker",
        
        // Büyük Kulüpler (Fransa)
        "psg", "paris saint-germain", "marseille", "om", "lyon", "ol",
        "monaco", "lille", "rennes", "nice", "le classique",
        
        // Büyük Kulüpler (Portekiz)
        "benfica", "porto", "sporting", "sporting lisbon", "braga",
        
        // Büyük Kulüpler (Hollanda)
        "ajax", "psv", "feyenoord", "az alkmaar", "de klassieker",
        
        // Türkiye
        "galatasaray", "fenerbahce", "fenerbahçe", "besiktas", "beşiktaş",
        "trabzonspor", "basaksehir", "başakşehir", "intercontinental derby",
        "kıtalararası derbi", "kadıköy derby", "vodafone park",
        
        // Diğer Önemli Kulüpler
        "celtic", "rangers", "ajax", "anderlecht", "club brugge", "dynamo kyiv",
        "red star", "partizan", "olympiacos", "panathinaikos", "besiktas",
        
        // Milli Takımlar
        "england", "spain", "france", "germany", "italy", "portugal", "brazil",
        "argentina", "netherlands", "belgium", "croatia", "turkey", "türkiye",
        "denmark", "sweden", "norway", "poland", "serbia", "switzerland",
        "austria", "czech republic", "ukraine", "russia", "greece", "romania",
        "hungary", "scotland", "wales", "ireland", "northern ireland",
        "usa", "mexico", "canada", "japan", "south korea", "australia",
        "morocco", "senegal", "nigeria", "egypt", "ghana", "cameroon",
        "colombia", "uruguay", "chile", "peru", "ecuador", "venezuela",
        
        // Efsane Oyuncular
        "messi", "ronaldo", "cristiano", "pelé", "pele", "maradona",
        "zidane", "beckham", "ronaldinho", "cruyff", "platini", "van basten",
        "maldini", "baresi", "cafu", "roberto carlos", "xavi", "iniesta",
        "pirlo", "totti", "del piero", "buffon", "casillas", "yashin",
        "puskas", "di stefano", "eusebio", "garrincha", "romario", "rivaldo",
        "henry", "bergkamp", "cantona", "giggs", "scholes", "gerrard",
        "lampard", "rooney", "shearer", "owen", "torres", "suarez",
        "lewandowski", "benzema", "modric", "kroos", "ramos", "pique",
        "neymar", "mbappé", "mbappe", "haaland", "salah", "kane",
        "de bruyne", "kante", "neuer", "ter stegen", "oblak", "alisson",
        "van dijk", "rudiger", "koulibaly", "marquinhos", "thiago silva",
        
        // Türk Efsaneler
        "hakan şükür", "hakan sukur", "rüştü reçber", "rustu recber",
        "emre belözoğlu", "emre belozoglu", "arda turan", "nihat kahveci",
        "hakan çalhanoğlu", "hakan calhanoglu", "burak yılmaz", "burak yilmaz",
        "cenk tosun", "sergen yalçın", "sergen yalcin", "tanju çolak",
        "metin oktay", "lefter küçükandonyadis",
        
        // Teknik Direktörler
        "guardiola", "klopp", "ancelotti", "mourinho", "conte", "allegri",
        "simeone", "nagelsmann", "tuchel", "pochettino", "zidane", "luis enrique",
        "alex ferguson", "wenger", "capello", "sacchi", "lippi", "del bosque",
        "low", "löw", "flick", "deschamps", "scaloni", "tite",
        
        // Stadyumlar
        "old trafford", "anfield", "stamford bridge", "emirates", "etihad",
        "camp nou", "bernabeu", "santiago bernabeu", "wanda metropolitano",
        "san siro", "allianz stadium", "olimpico", "signal iduna park",
        "allianz arena", "parc des princes", "estadio da luz", "dragao",
        "amsterdam arena", "johan cruyff arena", "turk telekom", "türk telekom",
        "vodafone park", "şükrü saracoğlu", "sukru saracoglu",
        
        // Ödüller
        "ballon d'or", "golden boot", "golden ball", "player of the year",
        "best player", "top scorer", "top scorers", "goalscorer", "goal scorer",
        "scorer", "scorers", "puskas award", "yashin trophy", "kopa trophy",
        
        // Taktik & Pozisyonlar
        "tactics", "taktik", "formation", "4-4-2", "4-3-3", "3-5-2", "pressing",
        "counter attack", "kontra atak", "tiki-taka", "gegenpressing",
        "false 9", "false nine", "wing back", "sweeper", "libero", "regista",
        "striker", "forvet", "winger", "kanat", "midfielder", "orta saha",
        "defender", "defans", "goalkeeper", "kaleci", "captain", "kaptan",
        
        // İstatistik & Analiz
        "xg", "expected goals", "assist", "asist", "clean sheet", "hat-trick",
        "hattrick", "brace", "dubble", "treble", "quadruple", "invincibles",
        "unbeaten", "comeback", "remontada", "miracle", "ucl night",
        
        // Genç & Kategoriler
        "u21", "u19", "u17", "youth", "academy", "la masia", "reserve",
        
        // Transfer & Sözleşme
        "transfer", "signing", "loan", "free agent", "release clause", "contract",
        "extension", "renewal", "bid", "offer", "negotiation",

        "world-class", "masterclass", "sensational", "incredible", "outstanding", "superb", "unbeatable", "legendary", "clinical",
        "shocking", "unbelievable", "mind-blowing", "stunning", "unexpected",
        "disastrous", "shambles", "terrible", "awful", "horrendous", "mediocre", "pointless", "flop", "failure", "howler", 
        
        "baller", "bottle it", "park the bus", "robbery",
         "rigged", "washed", "fraud", "clinical finisher", "game-changer", "silky", "talisman", "deadwood"
        "rubbish", "trash", "embarrassing", "catastrophic", "poor", "finished"
         "upset", "underdog", "miracle", "comeback", "dramatic", "last-minute", "unreal", "breathtaking", "surprising"
         "clutch", "goat", "top-tier", "flawless", "majestic", "prolific"
    ];

    const hasFootballSignal = footballKeywords.some((k) => text.includes(k));

    if (!hasFootballSignal) {
        return { ok: false, error: foulMessage };
    }

    return { ok: true };
}

export function assertFootballOnly(input: string, foulMessage: string = DEFAULT_FOUL_MESSAGE) {
    const res = aiFilter(input, foulMessage);
    if (!res.ok) {
        throw new Error(res.error);
    }
}
