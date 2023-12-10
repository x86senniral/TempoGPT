from openai import OpenAI
import sys
import json
import urllib.request
import urllib.parse
import re


client = OpenAI(api_key='OPENAI API KEY.')

# OpenWeatherMap API key and function
API_KEY = ''

#weather data
def get_weather(city):
    weather_url = f'https://api.openweathermap.org/data/2.5/weather?q={urllib.parse.quote(city)}&appid={API_KEY}'
    try:
        with urllib.request.urlopen(weather_url) as url:
            data = json.loads(url.read().decode())
            description = data['weather'][0]['description']
            return f"The weather in {data['name']} is currently described as {description}."
    except Exception as e:
        return f'An Error Has Occurred: {str(e)}'

def get_response(content):
    if 'weather' in content.lower() or 'temperature' in content.lower():
        city_pattern = r'in ([\w\s]+)'
        cities = re.findall(city_pattern, content)
        if cities:
            responses = []
            for city in cities:
                for sub_city in re.split(r'and|,', city):
                    trimmed_city = sub_city.strip()
                    if trimmed_city:
                        weather_info = get_weather(trimmed_city)
                        responses.append(weather_info)
            return json.dumps({"response": " ".join(responses)})
        else:
            return json.dumps({"response": "No city found in the query."})
    else:
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are 'Tempo' working for NRSSRN, an assistant answering user questions regarding only and i repeat, ONLY weather questions, if asked otherwise excuse yourself."},
                {"role": "user", "content": content}
            ],
        )
        return json.dumps({"response": completion.choices[0].message.content})


for line in sys.stdin:
    line = line.strip()
    if line == 'exit':
        break
    response = get_response(line)
    print(response)
