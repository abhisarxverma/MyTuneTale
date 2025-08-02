from urllib.parse import quote

def encode_query(query: str) -> str:
    return quote(query, safe='')

EMOTION_MAP = {
    "United States": {
        "sadness": encode_query(
            'artist:"Lewis Capaldi" OR artist:"Billie Eilish" OR track:"Fix You" OR track:"When the Party\'s Over" genre:"singer-songwriter" OR genre:indie'
        ),
        "happiness": encode_query(
            'artist:"Taylor Swift" OR artist:"Phillip Phillips" OR track:"Yellow" OR track:"Perfect" genre:"singer-songwriter" OR genre:"dance-pop"'
        ),
        "anger": encode_query(
            'artist:"Paramore" OR artist:"Linkin Park" OR track:"Wake Me Up When September Ends" OR track:"Happier Than Ever" genre:"singer-songwriter" OR genre:alternative'
        ),
        "anxiety": encode_query(
            'artist:"Bon Iver" OR artist:"Cigarettes After Sex" OR track:"Love Yourself" OR track:"Someone You Loved" genre:"singer-songwriter" OR genre:ambient'
        ),
        "nostalgia": encode_query(
            'artist:"Coldplay" OR artist:"Maroon 5" OR track:"Free Fallin\'" OR track:"A Thousand Years " genre:"singer-songwriter" OR genre:"classic rock"'
        ),
        "hope": encode_query(
            'artist:"John Mayer" OR artist:"Troy Sivan" OR track:"Wildflower" OR track:"The Scientist" genre:"singer-songwriter" OR genre:pop'
        ),
        "loneliness": encode_query(
            'artist:"Lana Del Ray" OR artist:"Conan Gray" OR track:"The Night We Met" OR track:"Summertime Sadness" genre:"singer-songwriter" OR genre:folk'
        ),
    },
    "India": {
        "sadness": encode_query('artist:"Arijit Singh" OR artist:"A.R. Rahman" track:"Husn" OR track:"Pehle Bhi Main" genre:bollywood OR genre:"singer-songwriter"'),
        "happiness": encode_query('artist:"Vishal Mishra" OR artist:"The Local Train" track:"Kesariya" OR track:"Tujh Mein Rab Dikhta Hai" genre:bollywood OR genre:pop OR genre:"singer-songwriter"'),
        "anger": encode_query('artist:"A.R. Rahman" OR artist:"Mohit Chauhan" track:"Saiyaara" OR track:"Agar Tum Saath Ho" genre:rock OR genre:bollywood OR genre:"singer-songwriter"'),
        "anxiety": encode_query('artist:"The Local Train" OR artist:"Darshan Raval" track:"Agar Tum Saath Ho" OR track:"Jee Le Zara" genre:ambient OR genre:"indie" OR genre:"singer-songwriter"'),
        "nostalgia": encode_query('artist:"Kishore Kumar" OR artist:"Pritam" track:"Kabhi Kabhi Aditi" OR track:"Chahun Main Ya Naa" genre:oldies OR genre:retro OR genre:"singer-songwriter"'),
        "hope": encode_query('artist:"Amit Trivedi" OR artist:"Sachin-jigar" track:"Ilahi" OR track:"Alag Aasmaan" genre:pop OR genre:bollywood OR genre:"singer-songwriter"'),
        "loneliness": encode_query('artist:"Kishore Kumar" OR artist:"Anuv Jain" track:"Jee Le Zara" OR track:"Tera Zikr" genre:indie OR genre:ambient OR genre:"singer-songwriter"')
    }
}
