#include <iostream>
#include <vector>
#include <cmath>
#include <cstdlib>
#include <ctime>
#include <fstream>
#include <sstream>
#include <string>
#include <algorithm>
using namespace std;

int input_size = 900, hidden_size = 40, output_size = 20;

class training_sample {
public:
    long long no;
    string name;
    vector<vector<double>> matrix;
};

vector<training_sample> training_set;
vector<vector<vector<double>>> recognition_set;

vector<string> output_names(output_size,"");

void initializeWeights(vector<vector<double>>& weights, int rows, int cols) {
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            weights[i][j] = (rand() % 200 - 100) / 100.0;  // [-1, 1)
            //weights[i][j] = (rand() / double(RAND_MAX)) * sqrt(2.0 / rows);
        }
    }
}

vector<double> get_input() {
    vector<double> i(input_size, 1);
    return i;
}

double sigmoid(double x) {
    return 1.0 / (1.0 + exp(-x));
}

double sigmoidDerivative(double x) {
    return x * (1.0 - x);
}


vector<vector<double>> weight_ith(input_size, vector<double>(hidden_size, 0.0)); // row: input, col: hidden
vector<vector<double>> weight_hto(hidden_size, vector<double>(output_size, 0.0)); // row: hidden, col: output
vector<double> hidden_layer_bias(hidden_size, 0.0);
vector<double> output_layer_bias(output_size, 0.0);
double learningRate = 0.001;

vector<double> input_layer_value(input_size, 0.0);
vector<double> hidden_layer_value(hidden_size, 0.0);
vector<double> output_layer_value(output_size, 0.0);


//input_layer_value = get_input();
vector<double> target(output_size, 0.0);


void forward() {
    for (int i = 0; i < hidden_size; i++) {
        double sum = 0.0;
        for (int j = 0; j < input_size; j++) {
            sum += weight_ith[j][i] * input_layer_value[j];
        }
        hidden_layer_value[i] = sigmoid(sum + hidden_layer_bias[i]);
    }


    for (int i = 0; i < output_size; i++) {
        double sum = 0.0;
        for (int j = 0; j < hidden_size; j++) {
            sum += weight_hto[j][i] * hidden_layer_value[j];
        }
        output_layer_value[i] = sigmoid(sum + output_layer_bias[i]);
    }

    /*for (int i = 0; i < output_size; i++) {
        cout << "value: " << output_layer_value[i] << endl;
    }*/
}


void backpropagation() {
    vector<double> outputDeltas(output_size);
    for (int k = 0; k < output_size; k++) {
        outputDeltas[k] = (output_layer_value[k] - target[k]) * output_layer_value[k] * (1 - output_layer_value[k]);
    }

    vector<double> hiddenDeltas(hidden_size);
    for (int j = 0; j < hidden_size; j++) {
        double error = 0.0;
        for (int k = 0; k < output_size; k++) {
            error += outputDeltas[k] * weight_hto[j][k];
        }
        hiddenDeltas[j] = error * hidden_layer_value[j] * (1 - hidden_layer_value[j]);
    }

    for (int j = 0; j < hidden_size; j++) {
        for (int k = 0; k < output_size; k++) {
            weight_hto[j][k] -= learningRate * hidden_layer_value[j] * outputDeltas[k];
        }
    }
    for (int i = 0; i < input_size; i++) {
        for (int j = 0; j < hidden_size; j++) {
            weight_ith[i][j] -= learningRate * input_layer_value[i] * hiddenDeltas[j];
        }
    }

    for (int j = 0; j < hidden_size; j++) {
        hidden_layer_bias[j] -= learningRate * hiddenDeltas[j];
    }
    for (int k = 0; k < output_size; k++) {
        output_layer_bias[k] -= learningRate * outputDeltas[k];
    }
}




void train() {
    for (int i = 0; i < training_set.size(); i++) {
        input_layer_value.clear();
        for (int j = 0; j < training_set[i].matrix.size(); j++) {
            for (int k = 0; k < training_set[i].matrix[j].size(); k++) {
                input_layer_value.push_back(training_set[i].matrix[j][k]);
            }
        }
        output_names[training_set[i].no - 1] = training_set[i].name;
        vector<double> target(output_size, 0.0);
        target[training_set[i].no] = 1;
        forward();
        backpropagation();
        for (int j = 0; j < hidden_size; j++) {
            cout << ">>>>>>>>>" << j << endl;
            for (int k = 0; k < output_size; k++) {
                cout << weight_hto[j][k];
            }
            cout << endl;
        }
    }
}

void recognize() {
    for (int i = 0; i < recognition_set.size(); i++) {
        input_layer_value.clear();
        for (int j = 0; j < recognition_set[i].size(); j++) {
            for (int k = 0; k < recognition_set[i][j].size(); k++) {
                //cout << recognition_set[i][j][k];
                input_layer_value.push_back(recognition_set[i][j][k]);
            }
            //cout << endl;
        }
        forward();
        struct number_value {
            long long no;
            double value;
        };
        vector<number_value> number_values;
        for (long long h = 0; h < output_size; h++) {
            number_value tmp;
            tmp.no = h;
            tmp.value = output_layer_value[h];
            number_values.push_back(tmp);
        }
        sort(number_values.begin(), number_values.end(), [](const number_value& a, const number_value& b) {
            return a.value > b.value;
        });
        cout << "\n\n------------------------------------\n" << endl;
        cout << "training data set " << i + 1 << endl;
        for (const auto& item : number_values) {
            std::cout << item.no + 1 << " > " << output_names[item.no] << " : " << item.value << std::endl;
        }
    }
}

void show_data(){
    for (int i = 0; i < training_set.size(); i++) {
        cout << "\n=========================" << endl;
        cout << "training set" << i << endl;
        cout << "no:" << training_set[i].no << endl;
        cout << "name:" << training_set[i].name << endl;
        cout << "size:" << training_set[i].matrix.size() << endl;
        for (int j = 0; j < training_set[i].matrix.size(); j++) {
            for (int k = 0; k < training_set[i].matrix[j].size(); k++) {
                cout << training_set[i].matrix[j][k];
            }
            cout << endl;
        }
    }
}

void show_data2() {
    for (int i = 0; i < recognition_set.size(); i++) {
        cout << "\n=========================" << endl;
        cout << "recognotion set" << i << endl;
        for (int j = 0; j < recognition_set[i].size(); j++) {
            for (int k = 0; k < recognition_set[i][j].size(); k++) {
                cout << recognition_set[i][j][k];
            }
            cout << endl;
        }
    }
}

void read_data_file(string filePath) {
    ifstream file(filePath);

    if (!file.is_open()) {
        cerr << "error reading file: " << filePath << endl;
        return;
    }

    string line;
    double number_of_samples = 0;




    if (getline(file, line)) {
        istringstream firstLineStream(line);
        string mode, sampleCount;

        if (getline(firstLineStream, mode, ',') && getline(firstLineStream, sampleCount, ',')) {
            number_of_samples = stod(sampleCount);
            cout << "Mode: " << mode << ", Number of Samples: " << number_of_samples << endl;

            if (mode == "train") {
                for (long long i = 0; i < number_of_samples; ++i) {
                    training_sample tmp_sample;
                    if (getline(file, line)) {
                        istringstream sampleLineStream(line);
                        string label, name;

                        if (getline(sampleLineStream, label, ',') && getline(sampleLineStream, name)) {
                            long long no = stoll(label);
                            tmp_sample.no = no;
                            tmp_sample.name = name;
                            //cout << "Sample " << i + 1 << " no: " << no << endl;
                            //cout << "Name: " << name << endl;
                        }

                        vector<vector<double>> tmp_matrix;
                        for (int j = 0; j < 30; ++j) {
                            if (getline(file, line)) {
                                istringstream dataLineStream(line);
                                string value;
                                vector<double> numbers;

                                while (getline(dataLineStream, value, ',')) {
                                    numbers.push_back(stod(value));
                                }

                                tmp_matrix.push_back(numbers);
                            }
                        }
                        tmp_sample.matrix = tmp_matrix;
                    }
                    training_set.push_back(tmp_sample);
                }
                //show_data();
                train();
            }
            else if (mode == "recognition") {
                for (long long i = 0; i < number_of_samples; ++i) {
                    //training_sample tmp_sample;
                    vector<vector<double>> tmp_matrix;
                    for (int j = 0; j < 30; ++j) {
                        if (getline(file, line)) {
                            istringstream dataLineStream(line);
                            string value;
                            vector<double> numbers;
                            while (getline(dataLineStream, value, ',')) {
                                numbers.push_back(stod(value));
                            }
                            tmp_matrix.push_back(numbers);
                        }
                    }
                    
                    recognition_set.push_back(tmp_matrix);
                }
                //show_data2();
                recognize();
            }
            else {
                cout << "mode error" << endl;
            }
        }
    }
    file.close();
}

int main() {
    srand(time(0));
    initializeWeights(weight_ith, input_size, hidden_size);
    initializeWeights(weight_hto, hidden_size, output_size);
    while (true) {
        cout << "input data set:" << endl;
        string training_data_path;
        getline(cin,training_data_path);
        //cin >> training_data_path;
        read_data_file(training_data_path);
    }
    int aaaaaaa;
    cin >> aaaaaaa;
}