from . import create_app

app = create_app()


if __name__ == "__main__":  # activate virtual env first with "source .venv/bin/activate"
    app.run(host="0.0.0.0", port=5000, debug=True)  # run server with "flask run --host=0.0.0.0"
