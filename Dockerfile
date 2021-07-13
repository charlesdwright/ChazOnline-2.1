FROM python:3.7-buster

ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

RUN /opt/venv/bin/python3 -m pip install --upgrade pip

COPY ./src /app
COPY requirements.txt /app
WORKDIR /app

RUN pip3 install -r requirements.txt
RUN pip3 install flask-cors --upgrade

ENTRYPOINT ["python3"]
CMD ["app.py"]
