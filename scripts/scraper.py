import requests
from bs4 import BeautifulSoup
import csv
import os
import time
from tqdm import tqdm

BASE_URL = "https://id.jobstreet.com/id/teknologi-jobs"
HEADERS = {'User-Agent': 'Mozilla/5.0'}

CSV_FOLDER = 'data'
CSV_FILE = os.path.join(CSV_FOLDER, 'search_engine.csv')

def save_to_csv(data, mode='a'):
    """Simpan data lowongan ke CSV tanpa menimpa data sebelumnya."""
    if not os.path.exists(CSV_FOLDER):
        os.makedirs(CSV_FOLDER)

    file_exists = os.path.isfile(CSV_FILE)

    with open(CSV_FILE, mode=mode, encoding='utf-8', newline='') as f:
        fieldnames = ['Title', 'Company', 'Location', 'Salary', 'JobType', 'DatePosted', 'URL', 'CompanyLogo', 'Description']
        writer = csv.DictWriter(f, fieldnames=fieldnames)

        # Tulis header hanya jika file belum ada atau mode 'w'
        if not file_exists or (mode == 'w' and os.stat(CSV_FILE).st_size == 0):
            writer.writeheader()

        for job in data:
            writer.writerow(job)
            print(f"✅ Data lowongan '{job['Title']}' berhasil disimpan ke CSV.")

def fetch_job_detail(job_url):
    """Ambil detail tipe pekerjaan dan deskripsi dari halaman job detail."""
    job_type_text = "Tipe pekerjaan tidak tersedia"
    description_text = "Deskripsi tidak tersedia"

    try:
        job_response = requests.get(job_url, headers=HEADERS)
        if job_response.status_code == 200:
            job_soup = BeautifulSoup(job_response.text, 'html.parser')

            job_type = job_soup.find(attrs={"data-automation": "job-detail-work-type"})
            if job_type:
                job_type_text = job_type.get_text(strip=True)

            description = job_soup.find("div", {"data-automation": "jobAdDetails"})
            if description:
                description_text = description.get_text(separator=' ', strip=True)
        else:
            print(f"⚠️ Gagal ambil detail pekerjaan, status code: {job_response.status_code}")
    except Exception as e:
        print(f"⚠️ Error saat ambil detail pekerjaan: {e}")

    return job_type_text, description_text

def load_existing_jobs():
    """Muat data dari CSV yang sudah ada untuk mencegah duplikasi."""
    existing_jobs = {}
    if os.path.exists(CSV_FILE):
        with open(CSV_FILE, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                existing_jobs[row['URL']] = row
    return existing_jobs

def scrape_jobs():
    """Scrape data lowongan dari JobStreet dan simpan semuanya ke CSV."""
    page = 1
    total_jobs = 0
    existing_jobs = load_existing_jobs()  # Hindari data duplikat

    while True:
        print(f"\n📌 Scraping halaman {page}... (Total sejauh ini: {total_jobs})")
        url = f"{BASE_URL}?page={page}"
        response = requests.get(url, headers=HEADERS)

        if response.status_code != 200:
            print(f"❌ Gagal ambil halaman {page}, status code: {response.status_code}")
            break

        soup = BeautifulSoup(response.text, 'html.parser')
        job_list = soup.find_all("article")

        if not job_list:
            print(f"ℹ️ Tidak ada lowongan di halaman {page}. Proses scraping selesai.")
            break

        jobs_data = []

        for job in tqdm(job_list, desc=f"🔍 Halaman {page}", unit="lowongan"):
            try:
                title = job.find(attrs={"data-automation": "jobTitle"})
                title_text = title.get_text(strip=True) if title else "Title not found"

                company = job.find(attrs={"data-automation": "jobCompany"})
                company_text = company.get_text(strip=True) if company else "Company not found"

                location = job.find(attrs={"data-automation": "jobLocation"})
                location_text = location.get_text(strip=True) if location else "Location not found"

                salary = job.find(attrs={"data-automation": "jobSalary"})
                salary_text = salary.get_text(strip=True) if salary else "Not specified"

                date_posted = job.find(attrs={"data-automation": "jobListingDate"})
                date_text = date_posted.get_text(strip=True) if date_posted else "Date not found"

                job_link = job.find("a", href=True)
                job_url = f"https://id.jobstreet.com{job_link['href']}" if job_link else "URL not found"

                logo_url = "Logo not available"
                logo = job.find(attrs={"data-automation": "company-logo-container"})
                if logo:
                    img_tag = logo.find('img')
                    if img_tag and img_tag.has_attr("src"):
                        logo_url = img_tag['src']

                # Ambil detail tambahan
                job_type_text, description_text = fetch_job_detail(job_url) if job_url else ("N/A", "N/A")

                # Hindari duplikat
                if job_url not in existing_jobs:
                    jobs_data.append({
                        "Title": title_text,
                        "Company": company_text,
                        "Location": location_text,
                        "Salary": salary_text,
                        "JobType": job_type_text,
                        "DatePosted": date_text,
                        "URL": job_url,
                        "CompanyLogo": logo_url,
                        "Description": description_text
                    })
                    existing_jobs[job_url] = True  # Tambahkan ke daftar yang sudah ada
            except Exception as e:
                print(f"⚠️ Error parsing lowongan: {e}")

        # Simpan data baru tanpa menimpa file CSV
        if jobs_data:
            save_to_csv(jobs_data, mode='a')
            total_jobs += len(jobs_data)

        page += 1
        time.sleep(2 + page % 3)

    print(f"\n🎉 Total {total_jobs} lowongan berhasil disimpan ke CSV di folder '{CSV_FOLDER}'.")

def run_scraping_periodically():
    """Jalankan scraping setiap 10 menit secara otomatis."""
    while True:
        print("🔄 Mulai proses scraping...")
        scrape_jobs()
        print("🕐 Tunggu 10 menit sebelum scraping berikutnya...")
        time.sleep(600)

if __name__ == "__main__":
    run_scraping_periodically()
