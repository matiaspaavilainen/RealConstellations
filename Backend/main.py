import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from typing import Optional, List
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from pymongo import AsyncMongoClient
from pydantic import BaseModel, Field
from pydantic.functional_validators import BeforeValidator
from typing_extensions import Annotated
from .data.data_fetch import Star

PyObjectId = Annotated[str, BeforeValidator(str)]


class ConstellationModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: Optional[str] = None
    astronomical_data: Optional[list[Star]] = None
    general_info: Optional[str] = None
    connections: Optional[list[str]] = None


class ConstellationCollection(BaseModel):
    constellations: List[ConstellationModel]


app = FastAPI()
templates = Jinja2Templates(directory="templates")

load_dotenv(".env")
db_user = os.getenv("MONGO_PROD_USER")
db_pass = os.getenv("MONGO_PROD_PASS")
db_uri = os.getenv("MONGO_DB_URI")
print(f"Logging in as {db_user}:{db_pass}")

client = AsyncMongoClient(db_uri, username=db_user, password=db_pass)
database = client.get_database("constellations")
collection = database.get_collection("constellations")

favicon_path = "favicon.ico"


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse(favicon_path)


@app.get("/")
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get(
    "/api/constellations/",
    response_description="Get the info for a constellation by name",
    response_model=ConstellationModel,
    response_model_include={"general_info"},
    response_model_by_alias=False,
)
async def get_info_by_name(name: str):
    if (
        constellation := await collection.find_one({"name": name}, {"general_info": 1})
    ) is not None:
        return constellation

    raise HTTPException(status_code=404, detail=f"Constellation {name} not found")


@app.get(
    "/api/constellations",
    response_description="Get the necessary info for all constellations",
    response_model=ConstellationCollection,
    response_model_exclude={"general_info"},
)
async def get_necessary_data_for_all():
    return ConstellationCollection(
        constellations=await collection.find({}, {"general_info": 0}).to_list()
    )
