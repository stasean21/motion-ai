// Episode 05 — данные из брифа (Google Trends, Roblox, Worldwide, 1 Jan–30 Sep 2026, экспорт 22 Oct 2026).
// Порядок показа — как в брифе: от низкого индекса к высокому, внутри ничьей — по алфавиту. Россия не включена (редакционное решение).
// [ISO numeric, флаг, подпись, индекс 0–100]
const DATA=[
 ['364','ir','Iran',1],['392','jp','Japan',1],['566','ng','Nigeria',4],['356','in','India',5],['756','ch','Switzerland',6],
 ['818','eg','Egypt',7],['380','it','Italy',7],['012','dz','Algeria',8],['040','at','Austria',8],['112','by','Belarus',8],
 ['050','bd','Bangladesh',9],['276','de','Germany',10],['410','kr','South Korea',10],['724','es','Spain',10],['246','fi','Finland',11],
 ['250','fr','France',11],['710','za','South Africa',11],['300','gr','Greece',12],['404','ke','Kenya',12],['158','tw','Taiwan',12],
 ['368','iq','Iraq',13],['372','ie','Ireland',13],['578','no','Norway',13],['586','pk','Pakistan',13],['682','sa','Saudi Arabia',13],
 ['752','se','Sweden',13],['804','ua','Ukraine',13],['056','be','Belgium',14],['348','hu','Hungary',14],['528','nl','Netherlands',14],
 ['191','hr','Croatia',15],['208','dk','Denmark',15],['398','kz','Kazakhstan',15],['203','cz','Czechia',16],['703','sk','Slovakia',16],
 ['792','tr','Türkiye',16],['036','au','Australia',17],['320','gt','Guatemala',17],['504','ma','Morocco',17],['620','pt','Portugal',17],
 ['100','bg','Bulgaria',18],['344','hk','Hong Kong',18],['376','il','Israel',18],['688','rs','Serbia',18],['826','gb','United Kingdom',18],
 ['616','pl','Poland',19],['124','ca','Canada',20],['188','cr','Costa Rica',20],['170','co','Colombia',21],['484','mx','Mexico',21],
 ['784','ae','United Arab Emirates',21],['840','us','United States',21],['591','pa','Panama',22],['702','sg','Singapore',22],['860','uz','Uzbekistan',22],
 ['032','ar','Argentina',23],['862','ve','Venezuela',23],['076','br','Brazil',24],['152','cl','Chile',24],['360','id','Indonesia',24],
 ['600','py','Paraguay',24],['524','np','Nepal',25],['554','nz','New Zealand',27],['031','az','Azerbaijan',28],['340','hn','Honduras',29],
 ['214','do','Dominican Republic',30],['268','ge','Georgia',30],['104','mm','Myanmar (Burma)',30],['642','ro','Romania',30],['233','ee','Estonia',31],
 ['428','lv','Latvia',32],['858','uy','Uruguay',32],['458','my','Malaysia',33],['068','bo','Bolivia',34],['222','sv','El Salvador',35],
 ['440','lt','Lithuania',39],['764','th','Thailand',39],['218','ec','Ecuador',41],
 ['116','kh','Cambodia',45],['704','vn','Vietnam',48],['604','pe','Peru',55],['608','ph','Philippines',75],['496','mn','Mongolia',100]];
// ранги «соревнования»: равные индексы — общий ранг (1 + число мест с большим индексом)
const RANK=DATA.map(d=>1+DATA.filter(e=>e[3]>d[3]).length),TIE=DATA.map(d=>DATA.filter(e=>e[3]===d[3]).length);
