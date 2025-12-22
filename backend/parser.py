import base64
import json
import os
import re
from io import BytesIO

import anthropic
from pdf2image import convert_from_path


def parse_technical_params(pdf_path, api_key):
    """
    Парсит ТОЛЬКО технические параметры из bottom-left зоны чертежа

    Returns:
        dict: {
            "DESIGN_TEMP": "...",
            "DESIGN_PRESSURE": "...",
            "PRESSURE_TEST_BODY": "...",
            "PRESSURE_TEST_SEAT": "..."
        }
    """

    print("🔄 Извлекаю технические параметры из bottom-left зоны...")

    # Конвертируем PDF в изображение
    images = convert_from_path(pdf_path, dpi=600)  # Высокое разрешение для OCR
    full_image = images[0]

    # Вырезаем bottom-left зону (где находятся технические параметры)
    width, height = full_image.size
    left = 0
    top = int(height * 0.65)  # Нижние 35%
    right = int(width * 0.35)  # Левые 35%
    bottom = height

    bottom_left = full_image.crop((left, top, right, bottom))

    # Конвертируем в base64
    buffered = BytesIO()
    bottom_left.save(buffered, format="PNG")
    img_base64 = base64.b64encode(buffered.getvalue()).decode()

    # Фокусированный промпт ТОЛЬКО для технических параметров
    prompt = """Extract ONLY the technical parameters from this section of an engineering drawing.

Look for these specific fields in the text block labeled "TECHNICAL REMARKS AND CONSTRUCTION DETAIL":

1. DESIGN TEMPERATURE - Look for line starting with "DESIGN TEMPERATURE:" followed by temperature range
2. DESIGN PRESSURE - Look for line starting with "DESIGN PRESSURE:" followed by pressure values
3. PRESSURE TEST BODY - Look for "PRESSURE TEST:" then "-BODY - HYDROSTATIC" followed by value
4. PRESSURE TEST SEAT - Look for "PRESSURE TEST:" then "-SEAT - HYDROSTATIC" followed by value

Return ONLY a valid JSON object with these exact fields:

{
  "DESIGN_TEMP": "value from drawing or empty string",
  "DESIGN_PRESSURE": "value from drawing or empty string",
  "PRESSURE_TEST_BODY": "value from drawing or empty string",
  "PRESSURE_TEST_SEAT": "value from drawing or empty string"
}

IMPORTANT:
- Include units (°C, °F, bar, psi, etc.) in the values
- If a field is not found, use empty string ""
- Return ONLY the JSON object, no markdown, no explanations
"""

    # Отправляем в Claude API
    client = anthropic.Anthropic(api_key=api_key)

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/png",
                            "data": img_base64,
                        },
                    },
                    {"type": "text", "text": prompt},
                ],
            }
        ],
    )

    response_text = response.content[0].text

    # Очищаем от markdown
    response_text = re.sub(r"```json\s*", "", response_text)
    response_text = re.sub(r"```\s*", "", response_text)
    response_text = response_text.strip()

    result = json.loads(response_text)

    print("✅ Технические параметры извлечены!")
    return result


def parse_drawing_pdf_ai(pdf_path, api_key):
    """
    Парсит PDF чертеж через Claude API

    Args:
        pdf_path: путь к PDF файлу
        api_key: Claude API ключ

    Returns:
        dict: {table1: [...], table2: [...], table3: [...]}
    """

    print("🔄 Конвертирую PDF в изображение...")
    images = convert_from_path(pdf_path, dpi=300)
    page1_image = images[0]

    print("🔄 Конвертирую изображение в base64...")
    buffered = BytesIO()
    page1_image.save(buffered, format="PNG")
    img_base64 = base64.b64encode(buffered.getvalue()).decode()

    prompt = """Extract data from this engineering drawing and return ONLY a valid JSON object.

CRITICAL: Your ENTIRE response must be ONLY valid JSON. No explanations, no markdown, no text before or after.

Extract these three tables:

**Table 1** (top-right dimensions table + technical parameters from bottom-left):

Part A - Dimensions table (top-right corner):
- Headers: SIZE(inch), ASME, ENDS, L, Ød, ØF, H, WEIGHT
- Extract the VALUES from the row below these headers

Part B - Technical specifications (BOTTOM-LEFT corner, inside text block):
Look for the section labeled "TECHNICAL REMARKS AND CONSTRUCTION DETAIL" or similar.
Inside this text block, extract:
- DESIGN_TEMP: Look for "DESIGN TEMPERATURE" followed by temperature range (e.g., "-40°C/0°C..+100°C/+200°C" or "-40°F..+200°F")
- DESIGN_PRESSURE: Look for "DESIGN PRESSURE" followed by pressure value
- PRESSURE_TEST_BODY: Look for "PRESSURE TEST" then "BODY" or "SHELL" followed by "HYDROSTATIC" and a number with bar/psi (e.g., "153.06 bar")
- PRESSURE_TEST_SEAT: Look for "PRESSURE TEST" then "SEAT" followed by "HYDROSTATIC" and a number with bar/psi (e.g., "112.3 bar")

If any of these fields are not found in the drawing, return empty string "".

**Table 2** (right-side Bill of Materials):
- Headers: Pos, Description, Material, Note
- Extract ALL rows from this table (usually 30-50 rows)
- If "Note" column is empty, use empty string ""

**Table 3** (bottom-right information block):
- Extract: CUSTOMER, PROJECT/LOCATION, EPC/END USER, P.O. No, TAG No, ECV JOB No, ITEM, VALVE D.S., DOC No

Return JSON in this EXACT structure:

{
  "table1": [
    {"field": "SIZE", "value": "12\""},
    {"field": "ASME", "value": "600"},
    {"field": "ENDS", "value": "RTJ"},
    {"field": "L", "value": "841"},
    {"field": "Ød", "value": "305"},
    {"field": "ØF", "value": "559"},
    {"field": "H", "value": "385~"},
    {"field": "WEIGHT", "value": "1200~"},
    {"field": "DESIGN_TEMP", "value": "-40°C/0°C..+100°C/+200°C"},
    {"field": "DESIGN_PRESSURE", "value": "...or empty string"},
    {"field": "PRESSURE_TEST_BODY", "value": "153.06 bar"},
    {"field": "PRESSURE_TEST_SEAT", "value": "112.3 bar"}
  ],
  "table2": [
    {"pos": "1", "description": "Body", "material": "ASTM A350 LF2 CL1", "note": ""},
    {"pos": "2", "description": "Body End", "material": "...", "note": "..."},
    ... (all other rows)
  ],
  "table3": [
    {"CUSTOMER": "value"},
    {"PROJECT/LOCATION": "value"},
    {"EPC/END USER": "value"},
    {"P.O. No": "value"},
    {"TAG No": "value"},
    {"ECV JOB No": "value"},
    {"ITEM": "value"},
    {"VALVE D.S.": "value"},
    {"DOC No": "value"}
  ]
}

IMPORTANT:
- Keep exact values including special characters (~, ", etc.)
- Preserve all text exactly as shown including units (bar, psi, °C, °F)
- If a field is not found in the drawing, use empty string ""
- For pressure test values, include both value AND unit (e.g., "153.06 bar" not just "153.06")
- DO NOT add any text outside the JSON object
"""

    print("🔄 Отправляю запрос в Claude API...")
    client = anthropic.Anthropic(api_key=api_key)

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4000,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/png",
                            "data": img_base64,
                        },
                    },
                    {"type": "text", "text": prompt},
                ],
            }
        ],
    )

    print("🔄 Обработка ответа...")
    response_text = response.content[0].text

    response_text = re.sub(r"```json\s*", "", response_text)
    response_text = re.sub(r"```\s*", "", response_text)
    response_text = response_text.strip()

    result = json.loads(response_text)
    result = fix_encoding(result)

    # ДВУХЭТАПНЫЙ ПАРСИНГ: Извлекаем технические параметры отдельно
    try:
        print("\n🔄 Второй этап: парсинг технических параметров...")
        tech_params = parse_technical_params(pdf_path, api_key)

        # Обновляем table1 с реальными значениями
        for item in result.get("table1", []):
            field = item.get("field", "")

            if field == "DESIGN_TEMP" and tech_params.get("DESIGN_TEMP"):
                item["value"] = tech_params["DESIGN_TEMP"]
            elif field == "DESIGN_PRESSURE" and tech_params.get("DESIGN_PRESSURE"):
                item["value"] = tech_params["DESIGN_PRESSURE"]
            elif field == "PRESSURE_TEST_BODY" and tech_params.get(
                "PRESSURE_TEST_BODY"
            ):
                item["value"] = tech_params["PRESSURE_TEST_BODY"]
            elif field == "PRESSURE_TEST_SEAT" and tech_params.get(
                "PRESSURE_TEST_SEAT"
            ):
                item["value"] = tech_params["PRESSURE_TEST_SEAT"]

        print("✅ Технические параметры добавлены в результат!")
    except Exception as e:
        print(f"⚠️ Ошибка при парсинге технических параметров: {e}")
        print("Продолжаем с пустыми значениями...")

    print("✅ Парсинг завершён!")
    return result


def fix_encoding(result):
    """Исправляет ТОЛЬКО технические проблемы кодировки UTF-8"""

    # Фикс символа Ø (это баг кодировки, не данные)
    for item in result.get("table1", []):
        for key in list(item.keys()):
            if "Ã˜" in key or "Ã" in key:
                # Заменяем битые UTF-8 символы
                new_key = key.replace("Ã˜", "Ø").replace("Ã", "")
                item[new_key] = item.pop(key)

    return result


if __name__ == "__main__":
    API_KEY = os.getenv("ANTHROPIC_API_KEY")

    PDF_PATH = "./test.pdf"

    try:
        result = parse_drawing_pdf_ai(PDF_PATH, API_KEY)

        print("\n" + "=" * 60)
        print("📊 РЕЗУЛЬТАТ ПАРСИНГА:")
        print("=" * 60)
        print(json.dumps(result, indent=2, ensure_ascii=False))

        with open("parsed_result_ai.json", "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)

        print("\n💾 Результат сохранён в parsed_result_ai.json")

        print("\n📈 СТАТИСТИКА:")
        print(f"  ✅ Table 1: {len(result.get('table1', []))} полей")
        print(f"  ✅ Table 2: {len(result.get('table2', []))} строк")
        print(f"  ✅ Table 3: {len(result.get('table3', []))} полей")

        if result.get("table2"):
            print(f"\n📋 Table 2 (первые 5 строк):")
            for item in result["table2"][:5]:
                print(
                    f"  Pos {item['pos']}: {item['description']} - {item['material']}"
                )

    except json.JSONDecodeError as e:
        print(f"❌ Ошибка парсинга JSON: {e}")
        print(f"Ответ Claude:\n{response_text}")
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback

        traceback.print_exc()
