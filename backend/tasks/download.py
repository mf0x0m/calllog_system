import asyncio
from pathlib import Path
from datetime import datetime, timedelta, date
import jpholiday
import pandas as pd
from playwright.async_api import async_playwright
from service.playwright_utils import login_to_webinsource
from config.settings import settings

CATEGORY_VALUES = ["1", "2"]
DATA_DIR = Path(__file__).resolve().parent.parent / "downloads"
DATA_DIR.mkdir(parents=True, exist_ok=True)

KEEP_COLUMNS = ["No", "開催日", "時間", "研修名", "会場名", "ROOM", "Web連携ID",
                "工程表ID", "講師", "ふりがな", "ZoomID", "ZoomPW"]

VENUE_REPLACE_MAP = {
    "【東京】インソース公開講座セミナールーム（第２龍名館ビル　受付５階）": "龍名館5F",
    "【東京】インソース公開講座セミナールーム（第２龍名館ビル　受付２階）": "龍名館2F",
    "【福岡】インソース九州ビルセミナールーム": "福岡",
    "【大阪】肥後橋センタービル（大阪支社セミナールーム）": "大阪",
    "【名古屋】インソース名古屋セミナールーム": "名古屋",
    "【仙台】インソース東北支社セミナールーム": "仙台",
    "【東京】白山セミナールーム（インソース白山ビル）": "白山",
    "【札幌】インソース北海道支社セミナールーム": "札幌",
    "【広島】広島YMCA国際文化センター　3号館": "広島",
}

def fmt_date(d: date) -> str:
    return d.strftime("%Y/%m/%d")

def is_business_day(d: date) -> bool:
    return d.weekday() < 5 and not jpholiday.is_holiday(d)

def normalize_room(x):
    try:
        f = float(x)
        return str(int(f)) if f.is_integer() else str(f)
    except:
        return x

#async def download_plants(p, target_dates: list[datetime], login_id: str, plants_password: str):
#    try:
#        print("別サイトのCSVダウンロード開始")
#
#        browser = await p.chromium.launch(headless=True)
#        context = await browser.new_context(accept_downloads=True)
#        page = await context.new_page()
#
#        # ① 初期URLにアクセス（ログイン画面にリダイレクトされる）
#        await page.goto("http://192.168.0.8/plants/t_koukaikouzakanris")
#        await page.wait_for_selector("#LoginuserLoginId", timeout=10000)
#
#        # ② ログイン処理
#        await page.fill("#LoginuserLoginId", login_id)
#        await page.fill("#LoginuserPassword", plants_password)
#        await page.click("#btnLogin")
#        print("別サイトログイン完了")
#
#        # ③ 対象ページにリダイレクトされる
#        await page.wait_for_selector("#TKoukaikouzakanriFormExcelKenshuubiShuuryoubi", timeout=10000)
#        print(f"検索画面到達")
#
#        # ④ 終了日（対象期間の末日）を入力
#        end_date = fmt_date(target_dates[-1])
#        await page.fill("#TKoukaikouzakanriFormExcelKenshuubiShuuryoubi", end_date)
#        print(f"公開講座 終了日入力: {end_date}")
#
#        # ⑤ ダウンロード処理
#        async with page.expect_download() as download_info:
#            await page.click("#Excel")
#        download = await download_info.value
#
#        # 🔽 ファイル名そのままで保存
#        download_path = DATA_DIR / download.suggested_filename
#        await download.save_as(str(download_path))
#        print(f"別サイトCSVダウンロード完了: {download_path.name}")
#
#    except Exception as e:
#        print(f"[別サイト] エラー: {e}")
#    finally:
#        await context.close()
#        await browser.close()


async def set_filters(page, target_date: datetime):
    date_str = fmt_date(target_date)
    await page.wait_for_selector("#open_training_app_cd", state="attached", timeout=10000)
    await page.evaluate(f"""
        const el = document.querySelector("#open_training_app_cd");
        el.value = '';
        [...el.options].forEach(opt => {{
            if ({CATEGORY_VALUES}.includes(opt.value)) opt.selected = true;
        }});
    """)
    await page.fill("#date_from_calender", date_str)
    await page.fill("#date_to_calender", date_str)
    print(f"{date_str} 開催日を設定")

async def download_webinsource_for_date(p, target_date: datetime, login_id: str, password: str):
    date_str = fmt_date(target_date)
    browser = await p.chromium.launch(headless=True)
    context = await browser.new_context(accept_downloads=True)
    page = await context.new_page()

    try:
        await login_to_webinsource(page, login_id, password)
        print(f"{date_str} ログイン成功")
        await page.goto(settings.WEBINSOURCE_KENSHU_URL)
        print(f"{date_str} 研修管理ページへ遷移")

        await set_filters(page, target_date)
        await page.click("#btnSearch", timeout=180000)
        await page.wait_for_selector("ul.pagination", timeout=180000)
        print(f"{date_str} 検索結果読み込み完了")

        async with page.expect_download() as download_info:
            await page.click("#btnCsv", timeout=180000, no_wait_after=True)
        download = await download_info.value

        filename = target_date.strftime("%y%m%d") + "_webinsource.csv"
        file_path = DATA_DIR / filename
        await download.save_as(str(file_path))
        print(f"{date_str} CSVダウンロード完了")

        df = pd.read_csv(file_path, encoding="cp932")

        if "開催日" in df.columns:
            df["開催日"] = date_str

        if "会場名" in df.columns:
            df["会場名"] = df["会場名"].replace(VENUE_REPLACE_MAP)
            df["会場名"] = df["会場名"].str.replace(
                r"【東京】インソース(.+?)セミナールーム", r"\1", regex=True
            )

        if "ROOM" in df.columns and "会議室名" in df.columns:
            df["ROOM"] = df["ROOM"].fillna(df["会議室名"])
            df.drop(columns=["会議室名"], inplace=True)

        if "ROOM" in df.columns:
            df["ROOM"] = df["ROOM"].apply(normalize_room)

        # --- 安定版 map処理（dict変換経由） ---
        koukaikouza_files = sorted(DATA_DIR.glob("koukaikouza_*.xlsx"))
        if koukaikouza_files:
            koukaikouza_df = pd.read_excel(koukaikouza_files[-1])
            koukaikouza_df.columns = koukaikouza_df.columns.str.replace("\n", "", regex=False)

            if "Web連携ID" in koukaikouza_df.columns:
                koukaikouza_df = koukaikouza_df.dropna(subset=["Web連携ID"]).drop_duplicates("Web連携ID")

                for col in ["工程表ID", "講師", "ふりがな", "MeetingID", "Meetingパスワード"]:
                    if col in koukaikouza_df.columns:
                        mapping_dict = koukaikouza_df.set_index("Web連携ID")[col].to_dict()
                        df[col] = df["Web連携ID"].map(mapping_dict)

                if "Meetingパスワード" in df.columns:
                    df["Meetingパスワード"] = df["Meetingパスワード"].str.replace("\n", " ", regex=False)

        df.rename(columns={
            "MeetingID": "ZoomID",
            "Meetingパスワード": "ZoomPW"
        }, inplace=True)

        df.to_csv(file_path, index=False, encoding="cp932")
        print(f"{date_str} CSV整形・保存完了")

    except Exception as e:
        print(f"[{date_str}] エラー: {e}")
    finally:
        await context.close()
        await browser.close()

def merge_csv_and_renumber():
    today_str = datetime.today().strftime("%y%m%d")
    output_file = DATA_DIR / f"{today_str}_webinsource_merged.csv"

    files = sorted(DATA_DIR.glob("*_webinsource.csv"))
    merged = pd.DataFrame()
    for file in files:
        df = pd.read_csv(file, encoding="cp932")
        df = df[[col for col in KEEP_COLUMNS if col in df.columns]]
        merged = pd.concat([merged, df], ignore_index=True)

    if "No" in merged.columns:
        merged["No"] = range(1, len(merged) + 1)

    merged.to_csv(output_file, index=False, encoding="cp932")
    print(f"CSVマージ完了: {output_file.name}")

    for file in files:
        if file.name != output_file.name:
            try:
                file.unlink()
            except Exception as e:
                print(f"[削除失敗] {file.name}: {e}")

async def run_parallel_downloads(login_id: str, password: str):
    days_ahead = 10
    concurrency = 4

    today = date.today()
    target_dates = [
        datetime.combine(today + timedelta(days=i), datetime.min.time())
        for i in range(days_ahead + 1)
        if is_business_day(today + timedelta(days=i))
    ]

    sem = asyncio.Semaphore(concurrency)

    async with async_playwright() as p:

        #await download_plants(p, target_dates, login_id, plants_password)

        async def sem_task(d):
            async with sem:
                await download_webinsource_for_date(p, d, login_id, password)

        await asyncio.gather(*(sem_task(d) for d in target_dates))

    merge_csv_and_renumber()

if __name__ == "__main__":
    login_id = "suc1588"
    password = "-7EEuf-eniWxVQ"
#    plants_password = "hD2JJYir!7KjNS"
    asyncio.run(run_parallel_downloads(login_id, password))

#if __name__ == "__main__":
#    import asyncio
#    from datetime import date, timedelta, datetime
#    from playwright.async_api import async_playwright
#
#    login_id = "suc1588"
#    password = "-7EEuf-eniWxVQ"
#    days_ahead = 10
#
#    today = date.today()
#    target_dates = [
#        datetime.combine(today + timedelta(days=i), datetime.min.time())
#        for i in range(days_ahead + 1)
#        if is_business_day(today + timedelta(days=i))
#    ]
#
#    async def test_download_plants():
#        async with async_playwright() as p:
#            await download_plants(p, target_dates, login_id, password)
#
#    asyncio.run(test_download_plants())
